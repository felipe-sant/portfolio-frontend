import { readFileSync } from "node:fs"
import type { Root } from "react-dom/client"
import type { MockInstance } from "vitest"
import { afterEach, beforeEach, describe, expect, inject, it, vi } from "vitest"
import { act, screen, within } from "@testing-library/react"
import composePage from "@scripts/prerender/composePage"
import i18n from "@/i18n/i18n"
import mountClient from "@/prerender/mountClient"
import buildProfile from "@/testUtils/buildProfile"
import parseUntyped from "@/testUtils/parseUntyped"
import stubContentFetch from "@/testUtils/stubContentFetch"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

const TEMPLATE =
    '<!doctype html><html lang="pt-BR"><head><title>Estático</title><meta name="description" content="Estática" /></head><body><noscript>x</noscript><div id="root"></div></body></html>'

function injectPrerendered(file: string, rootElement: HTMLElement) {
    const fixture = inject("prerenderFixtures").find((candidate) => candidate.target.file === file)

    if (!fixture) {
        throw new Error(`Fixture ${file} não gerada pelo globalSetup`)
    }

    const { target, result } = fixture
    const page = composePage(TEMPLATE, result, target, "x", "/")
    const parsed = new DOMParser().parseFromString(page, "text/html")

    document.head.innerHTML = parsed.head.innerHTML
    rootElement.innerHTML = parsed.getElementById("root")?.innerHTML ?? ""
    window.prerenderedPath = `/${target.path}`
    window.preloadedState = JSON.parse(result.state)
    window.routerData = JSON.parse(result.routerData)
}

const REAL_PROJECTS = parseUntyped(readFileSync("public/content/pt-BR/projects.json", "utf-8"))

function stubProjectsContent() {
    return stubContentFetch({
        "content/pt-BR/profile.json": buildProfile(),
        "content/pt-BR/projects.json": REAL_PROJECTS
    })
}

function countRegion() {
    return within(screen.getByRole("main")).getByRole("status")
}

function cardTitles() {
    return screen
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.querySelector("a")?.textContent)
}

async function settle() {
    await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 150))
    })
}

function spyOnConsole() {
    return {
        error: vi.spyOn(console, "error").mockImplementation(() => undefined),
        warn: vi.spyOn(console, "warn").mockImplementation(() => undefined)
    }
}

function hydrationWarnings(spy: MockInstance<typeof console.warn>) {
    return spy.mock.calls.filter(
        ([message]) => !String(message).includes("InvariantMiddleware took")
    )
}

let rootElement: HTMLElement
let mountedRoots: Root[] = []

async function mount() {
    await act(async () => {
        mountedRoots.push(mountClient(rootElement))
    })
}

beforeEach(() => {
    rootElement = document.createElement("div")
    document.body.appendChild(rootElement)
    stubContentFetch({
        "content/pt-BR/profile.json": buildProfile(),
        "content/en/profile.json": buildProfile(),
        "content/es/profile.json": buildProfile()
    })
})

afterEach(async () => {
    await act(async () => {
        mountedRoots.forEach((root) => root.unmount())
    })
    mountedRoots = []
    rootElement.remove()
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
    document.head.innerHTML = ""
    window.prerenderedPath = undefined
    window.preloadedState = undefined
    window.routerData = undefined
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    window.history.pushState({}, "", "/")
})

describe("mountClient sem caminho pré-renderizado", () => {
    it("renderiza no cliente usando o BASE_URL como basename", async () => {
        vi.stubEnv("BASE_URL", "/ra2581392423047/")
        window.history.pushState({}, "", "/ra2581392423047/en")

        await mount()

        expect(
            await screen.findByRole("heading", { name: "Full stack developer in TypeScript" })
        ).toBeInTheDocument()
    })

    it("remove o title e a meta description do index.html e deixa só os da página", async () => {
        document.head.innerHTML =
            '<title>Estático</title><meta name="description" content="Estática" />'
        window.history.pushState({}, "", "/pt-BR")

        await mount()

        await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        expect(document.head.querySelectorAll("title")).toHaveLength(1)
        expect(document.title).toBe("Portfólio · Luiz Felipe dos Santos")
        expect(document.head.querySelectorAll("meta[name='description']")).toHaveLength(1)
    })
})

describe("mountClient com caminho pré-renderizado", () => {
    it("hidrata o HTML gerado sem erro nem aviso e mantém o h1 do servidor", async () => {
        injectPrerendered("en.html", rootElement)
        await i18n.changeLanguage("en")
        window.history.pushState({}, "", "/en")
        const heading = screen.getByRole("heading", { name: "Full stack developer in TypeScript" })
        const consoleSpies = spyOnConsole()
        const errorListener = vi.fn()
        window.addEventListener("error", errorListener)

        await mount()
        await settle()

        window.removeEventListener("error", errorListener)
        expect(screen.getByRole("heading", { name: "Full stack developer in TypeScript" })).toBe(
            heading
        )
        expect(consoleSpies.error).not.toHaveBeenCalled()
        expect(hydrationWarnings(consoleSpies.warn)).toEqual([])
        expect(errorListener).not.toHaveBeenCalled()
        expect(document.head.querySelectorAll("title")).toHaveLength(1)
    })

    it("hidrata sem erro nem aviso com IntersectionObserver disponível", async () => {
        class StubObserver {
            observe = vi.fn()
            disconnect = vi.fn()
            unobserve = vi.fn()
            takeRecords = vi.fn(() => [])
        }
        vi.stubGlobal("IntersectionObserver", StubObserver)
        injectPrerendered("en.html", rootElement)
        await i18n.changeLanguage("en")
        window.history.pushState({}, "", "/en")
        const consoleSpies = spyOnConsole()

        await mount()
        await settle()

        expect(consoleSpies.error).not.toHaveBeenCalled()
        expect(hydrationWarnings(consoleSpies.warn)).toEqual([])
    })

    it("hidrata sem erro com tema escuro salvo e movimento reduzido", async () => {
        localStorage.setItem(THEME_STORAGE_KEY, "dark")
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        injectPrerendered("pt-BR.html", rootElement)
        await i18n.changeLanguage("pt-BR")
        window.history.pushState({}, "", "/pt-BR")
        const consoleSpies = spyOnConsole()

        await mount()
        await settle()

        expect(document.documentElement).toHaveAttribute("data-theme", "dark")
        expect(document.documentElement).toHaveAttribute("data-motion", "reduced")
        expect(consoleSpies.error).not.toHaveBeenCalled()
        expect(hydrationWarnings(consoleSpies.warn)).toEqual([])
    })

    it("usa createRoot e deixa um único title quando o 404.html chega em outra URL", async () => {
        injectPrerendered("404.html", rootElement)
        await i18n.changeLanguage("pt-BR")
        window.history.pushState({}, "", "/pt-BR/xyz")
        const consoleSpies = spyOnConsole()

        await mount()
        await settle()

        expect(
            await screen.findByRole("heading", { name: "Página não encontrada" })
        ).toBeInTheDocument()
        expect(document.head.querySelectorAll("title")).toHaveLength(1)
        expect(document.title).toBe("Página não encontrada · Luiz Felipe dos Santos")
        expect(document.head.querySelectorAll("meta[name='description']")).toHaveLength(1)
        expect(document.head.querySelectorAll("meta[name='robots']")).toHaveLength(1)
        expect(consoleSpies.error).not.toHaveBeenCalled()
        expect(document.documentElement.lang).toBe("pt-BR")
    })

    it("hidrata pt-BR/projects.html sem erro nem aviso e mantém os cards do HTML", async () => {
        injectPrerendered("pt-BR/projects.html", rootElement)
        await i18n.changeLanguage("pt-BR")
        window.history.pushState({}, "", "/pt-BR/projects")
        const link = screen.getByRole("link", { name: "Maps" })
        const consoleSpies = spyOnConsole()

        await mount()
        await settle()

        expect(screen.getByRole("link", { name: "Maps" })).toBe(link)
        expect(cardTitles()).toHaveLength(6)
        expect(consoleSpies.error).not.toHaveBeenCalled()
        expect(hydrationWarnings(consoleSpies.warn)).toEqual([])
    })

    it("hidrata com a query na URL: primeira renderização igual ao HTML e filtro aplicado depois", async () => {
        stubProjectsContent()
        injectPrerendered("pt-BR/projects.html", rootElement)
        await i18n.changeLanguage("pt-BR")
        window.history.pushState({}, "", "/pt-BR/projects?type=web&sort=title")
        const consoleSpies = spyOnConsole()

        await mount()
        await settle()

        expect(screen.getByRole("button", { name: "Web" })).toHaveAttribute("aria-pressed", "true")
        expect(screen.getByRole("combobox", { name: "Ordenar" })).toHaveValue("title")
        expect(cardTitles()).toEqual([
            "Controle de Despesas",
            "Conversor de Unidades",
            "Maps",
            "MNIST Classifier",
            "Pedido de Namoro Irrecusável"
        ])
        expect(consoleSpies.error).not.toHaveBeenCalled()
        expect(hydrationWarnings(consoleSpies.warn)).toEqual([])
    })

    it("não deixa a tela em Carregando projetos ao hidratar", async () => {
        injectPrerendered("pt-BR/projects.html", rootElement)
        await i18n.changeLanguage("pt-BR")
        window.history.pushState({}, "", "/pt-BR/projects")
        const observed: string[] = []
        const observer = new MutationObserver(() => observed.push(countRegion().textContent ?? ""))
        observer.observe(rootElement, { childList: true, subtree: true, characterData: true })

        await mount()
        await settle()
        observer.disconnect()

        expect(countRegion()).toHaveTextContent("6 de 6 projetos")
        expect(observed.join(" ")).not.toContain("Carregando")
    })
})

describe("mountClient de Projetos sem HTML pré-renderizado", () => {
    it("aplica a query já na primeira renderização", async () => {
        const fetchMock = stubProjectsContent()
        await i18n.changeLanguage("pt-BR")
        window.history.pushState({}, "", "/pt-BR/projects?type=web&sort=title")

        await mount()

        expect(await screen.findByRole("heading", { name: "Conversor de Unidades" })).toBeVisible()
        expect(screen.getByRole("button", { name: "Web" })).toHaveAttribute("aria-pressed", "true")
        const requests = fetchMock.mock.calls.filter(([url]) =>
            String(url).includes("projects.json")
        )
        expect(requests).toHaveLength(2)
    })
})
