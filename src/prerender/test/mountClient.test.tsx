import { readFileSync } from "node:fs"
import { startTransition } from "react"
import type { Root } from "react-dom/client"
import { hydrateRoot } from "react-dom/client"
import type { MockInstance } from "vitest"
import { afterEach, beforeEach, describe, expect, inject, it, vi } from "vitest"
import { act, screen, within } from "@testing-library/react"
import composePage from "@scripts/prerender/composePage"
import i18n from "@/i18n/i18n"
import mountClient from "@/prerender/mountClient"
import buildProfile from "@/testUtils/buildProfile"
import parseUntyped from "@/testUtils/parseUntyped"
import relaxAsyncUtilTimeout from "@/testUtils/relaxAsyncUtilTimeout"
import stubContentFetch from "@/testUtils/stubContentFetch"
import loadMarkdownRenderer from "@/utils/loadMarkdownRenderer"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"
import PRERENDER_DATA_ID from "@/utils/prerenderDataId"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

relaxAsyncUtilTimeout()

vi.mock("@/utils/loadMarkdownRenderer", async (importOriginal) => {
    const original = await importOriginal<typeof import("@/utils/loadMarkdownRenderer")>()

    return { default: vi.fn(original.default) }
})

const transitionState = vi.hoisted(() => ({ active: false, hydratedInTransition: [] as boolean[] }))

vi.mock("react", async (importOriginal) => {
    const original = await importOriginal<typeof import("react")>()

    return {
        ...original,
        startTransition: vi.fn<typeof original.startTransition>((callback) => {
            transitionState.active = true
            try {
                original.startTransition(callback)
            } finally {
                transitionState.active = false
            }
        })
    }
})

vi.mock("react-dom/client", async (importOriginal) => {
    const original = await importOriginal<typeof import("react-dom/client")>()

    return {
        ...original,
        hydrateRoot: vi.fn<typeof original.hydrateRoot>((...args) => {
            transitionState.hydratedInTransition.push(transitionState.active)

            return original.hydrateRoot(...args)
        })
    }
})

const PROJECT_ID = "01a131df-93ee-72f3-8c7a-f67501e47a7a"

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

    const dataBlock = parsed.getElementById(PRERENDER_DATA_ID)

    if (!dataBlock) {
        throw new Error(`Bloco ${PRERENDER_DATA_ID} ausente em ${file}`)
    }

    document.head.innerHTML = parsed.head.innerHTML
    rootElement.innerHTML = parsed.getElementById("root")?.innerHTML ?? ""
    document.body.appendChild(document.importNode(dataBlock, true))
}

const REAL_PROJECTS = parseUntyped(readFileSync("public/content/pt-BR/projects.json", "utf-8"))

function stubProjectsContent() {
    return stubContentFetch({
        "content/pt-BR/profile.json": buildProfile(),
        "content/pt-BR/projects.json": REAL_PROJECTS
    })
}

function readJsonLdText() {
    return document.querySelector('script[type="application/ld+json"]')?.textContent ?? null
}

function countRegion() {
    return within(screen.getByRole("main")).getByRole("status")
}

function cardTitles() {
    return screen
        .getAllByRole("article")
        .map((card) => within(card).getByRole("heading").querySelector("a")?.textContent)
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
        mountedRoots.push(await mountClient(rootElement))
    })
}

beforeEach(() => {
    vi.mocked(startTransition).mockClear()
    vi.mocked(hydrateRoot).mockClear()
    transitionState.hydratedInTransition = []
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
    document.getElementById(PRERENDER_DATA_ID)?.remove()
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
            await screen.findByRole("heading", { name: "Junior full stack developer" })
        ).toBeInTheDocument()
    })

    it("não usa startTransition ao renderizar com createRoot", async () => {
        window.history.pushState({}, "", "/pt-BR")

        await mount()

        await screen.findByRole("heading", { name: "Desenvolvedor full stack Júnior" })
        expect(startTransition).not.toHaveBeenCalled()
        expect(hydrateRoot).not.toHaveBeenCalled()
    })

    it("remove o title e a meta description do index.html e deixa só os da página", async () => {
        document.head.innerHTML =
            '<title>Estático</title><meta name="description" content="Estática" />'
        window.history.pushState({}, "", "/pt-BR")

        await mount()

        await screen.findByRole("heading", { name: "Desenvolvedor full stack Júnior" })
        expect(document.head.querySelectorAll("title")).toHaveLength(1)
        expect(document.title).toBe("Portfólio · Luiz Felipe dos Santos")
        expect(document.head.querySelectorAll("meta[name='description']")).toHaveLength(1)
    })
})

describe("mountClient com HTML pré-renderizado sem bloco de dados", () => {
    it("usa createRoot sem estado e troca o HTML do servidor", async () => {
        injectPrerendered("en.html", rootElement)
        document.getElementById(PRERENDER_DATA_ID)?.remove()
        await i18n.changeLanguage("en")
        window.history.pushState({}, "", "/en")
        const serverHeading = screen.getByRole("heading", { name: "Junior full stack developer" })

        await mount()

        expect(
            await screen.findByRole("heading", { name: "Junior full stack developer" })
        ).not.toBe(serverHeading)
        expect(serverHeading).not.toBeInTheDocument()
    })
})

describe("mountClient com caminho pré-renderizado", () => {
    it("hidrata dentro de startTransition e devolve o Root da hidratação", async () => {
        injectPrerendered("en.html", rootElement)
        await i18n.changeLanguage("en")
        window.history.pushState({}, "", "/en")

        await mount()
        await settle()

        expect(startTransition).toHaveBeenCalledTimes(1)
        expect(transitionState.hydratedInTransition).toEqual([true])
        expect(mountedRoots).toEqual([vi.mocked(hydrateRoot).mock.results[0]?.value])
    })

    it("hidrata o HTML gerado sem erro nem aviso e mantém o h1 do servidor", async () => {
        injectPrerendered("en.html", rootElement)
        await i18n.changeLanguage("en")
        window.history.pushState({}, "", "/en")
        const heading = screen.getByRole("heading", { name: "Junior full stack developer" })
        const consoleSpies = spyOnConsole()
        const errorListener = vi.fn()
        window.addEventListener("error", errorListener)

        await mount()
        await settle()

        window.removeEventListener("error", errorListener)
        expect(screen.getByRole("heading", { name: "Junior full stack developer" })).toBe(heading)
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
        const htmlJsonLd = readJsonLdText()
        const consoleSpies = spyOnConsole()

        await mount()
        await settle()

        expect(screen.getByRole("link", { name: "Maps" })).toBe(link)
        expect(readJsonLdText()).toBe(htmlJsonLd)
        expect(cardTitles()).toHaveLength(6)
        expect(screen.getByRole("heading", { level: 2, name: "Experimentos" })).toBeInTheDocument()
        expect(consoleSpies.error).not.toHaveBeenCalled()
        expect(hydrationWarnings(consoleSpies.warn)).toEqual([])
    })

    it.each([
        ["pt-BR/about.html", "pt-BR", "/pt-BR/about"],
        ["en/about.html", "en", "/en/about"]
    ])("hidrata %s sem erro nem aviso e mantém o h1 do HTML", async (file, language, path) => {
        class StubObserver {
            observe = vi.fn()
            disconnect = vi.fn()
            unobserve = vi.fn()
            takeRecords = vi.fn(() => [])
        }
        vi.stubGlobal("IntersectionObserver", StubObserver)
        injectPrerendered(file, rootElement)
        await i18n.changeLanguage(language)
        window.history.pushState({}, "", path)
        const heading = screen.getByRole("heading", { level: 1, name: "Luiz Felipe dos Santos" })
        const hiddenDetail = rootElement.querySelectorAll("li > [hidden]")
        const consoleSpies = spyOnConsole()

        await mount()
        await settle()

        expect(screen.getByRole("heading", { level: 1, name: "Luiz Felipe dos Santos" })).toBe(
            heading
        )
        expect(hiddenDetail.length).toBeGreaterThan(0)
        expect(rootElement.querySelectorAll("li > [hidden]")).toHaveLength(hiddenDetail.length)
        expect(consoleSpies.error).not.toHaveBeenCalled()
        expect(hydrationWarnings(consoleSpies.warn)).toEqual([])
    })

    it.each([
        [
            "o README do projeto",
            `pt-BR/projects/${PROJECT_ID}.html`,
            `/pt-BR/projects/${PROJECT_ID}`
        ],
        [
            "um documento do projeto",
            `pt-BR/projects/${PROJECT_ID}/docs/SETUP.md.html`,
            `/pt-BR/projects/${PROJECT_ID}/docs/SETUP.md`
        ]
    ])(
        "hidrata %s sem erro nem aviso, mantém o h1 e carrega o renderizador de markdown antes",
        async (_name, file, url) => {
            injectPrerendered(file, rootElement)
            await i18n.changeLanguage("pt-BR")
            window.history.pushState({}, "", url)
            vi.mocked(loadMarkdownRenderer).mockClear()
            const heading = screen.getByRole("heading", { level: 1, name: "MNIST Classifier" })
            const consoleSpies = spyOnConsole()

            await mount()
            await settle()

            expect(loadMarkdownRenderer).toHaveBeenCalled()
            expect(screen.getByRole("heading", { level: 1, name: "MNIST Classifier" })).toBe(
                heading
            )
            expect(consoleSpies.error).not.toHaveBeenCalled()
            expect(hydrationWarnings(consoleSpies.warn)).toEqual([])
        }
    )

    it("hidrata o documento de texto sem erro nem aviso e sem carregar o renderizador de markdown", async () => {
        injectPrerendered(`pt-BR/projects/${PROJECT_ID}/docs/LICENSE.html`, rootElement)
        await i18n.changeLanguage("pt-BR")
        window.history.pushState({}, "", `/pt-BR/projects/${PROJECT_ID}/docs/LICENSE`)
        vi.mocked(loadMarkdownRenderer).mockClear()
        const license = screen.getByRole("region", { name: "LICENSE" })
        const consoleSpies = spyOnConsole()

        await mount()
        await settle()

        expect(screen.getByRole("region", { name: "LICENSE" })).toBe(license)
        expect(loadMarkdownRenderer).not.toHaveBeenCalled()
        expect(consoleSpies.error).not.toHaveBeenCalled()
        expect(hydrationWarnings(consoleSpies.warn)).toEqual([])
    })

    it("não carrega o renderizador de markdown ao hidratar a lista de projetos", async () => {
        injectPrerendered("pt-BR/projects.html", rootElement)
        await i18n.changeLanguage("pt-BR")
        window.history.pushState({}, "", "/pt-BR/projects")
        vi.mocked(loadMarkdownRenderer).mockClear()

        await mount()
        await settle()

        expect(loadMarkdownRenderer).not.toHaveBeenCalled()
    })

    it.each([
        "/pt-BR/projects?type=web&sort=title",
        "/pt-BR/projects?tech=Leaflet&year=2025",
        "/pt-BR/projects?sort=title&tech=Leaflet",
        "/pt-BR/projects?tech=Docker"
    ])("hidrata %s sem erro nem aviso de hidratação", async (url) => {
        stubProjectsContent()
        injectPrerendered("pt-BR/projects.html", rootElement)
        await i18n.changeLanguage("pt-BR")
        window.history.pushState({}, "", url)
        const consoleSpies = spyOnConsole()

        await mount()
        await settle()

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
    it("aplica a query já na primeira renderização com um pedido de projects.json e um de profile.json para lista e opções", async () => {
        const fetchMock = stubProjectsContent()
        await i18n.changeLanguage("pt-BR")
        window.history.pushState({}, "", "/pt-BR/projects?type=web&sort=title")

        await mount()

        expect(await screen.findByRole("heading", { name: "Conversor de Unidades" })).toBeVisible()
        expect(screen.getByRole("button", { name: "Web" })).toHaveAttribute("aria-pressed", "true")
        const requests = fetchMock.mock.calls.filter(([url]) =>
            String(url).includes("projects.json")
        )
        expect(requests).toHaveLength(1)
        const profileRequests = fetchMock.mock.calls.filter(([url]) =>
            String(url).includes("profile.json")
        )
        expect(profileRequests).toHaveLength(1)
    })
})
