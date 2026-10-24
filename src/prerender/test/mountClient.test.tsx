import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { act, screen } from "@testing-library/react"
import mountClient from "@/prerender/mountClient"
import buildProfile from "@/testUtils/buildProfile"
import stubContentFetch from "@/testUtils/stubContentFetch"

let rootElement: HTMLElement

beforeEach(() => {
    rootElement = document.createElement("div")
    document.body.appendChild(rootElement)
    stubContentFetch({
        "content/pt-BR/profile.json": buildProfile(),
        "content/en/profile.json": buildProfile(),
        "content/es/profile.json": buildProfile()
    })
})

afterEach(() => {
    rootElement.remove()
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

        await act(async () => {
            mountClient(rootElement)
        })

        expect(
            await screen.findByRole("heading", { name: "Full stack developer in TypeScript" })
        ).toBeInTheDocument()
    })

    it("remove o title e a meta description do index.html e deixa só os da página", async () => {
        document.head.innerHTML =
            '<title>Estático</title><meta name="description" content="Estática" />'
        window.history.pushState({}, "", "/pt-BR")

        await act(async () => {
            mountClient(rootElement)
        })

        await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        expect(document.head.querySelectorAll("title")).toHaveLength(1)
        expect(document.title).toBe("Luiz Felipe dos Santos · Desenvolvedor full stack")
        expect(document.head.querySelectorAll("meta[name='description']")).toHaveLength(1)
    })
})
