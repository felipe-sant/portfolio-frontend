import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"
import routes from "@/routers/routes"
import buildProfile from "@/testUtils/buildProfile"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"

function renderRoutes(initialEntries: string[]) {
    const router = createMemoryRouter(routes, { initialEntries })
    renderWithStore(<RouterProvider router={router} />)
    return router
}

function stubBrowser(languages: string[]) {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(languages)
    vi.spyOn(navigator, "language", "get").mockReturnValue(languages[0] ?? "")
}

beforeEach(() => {
    stubContentFetch({
        "content/pt-BR/profile.json": buildProfile(),
        "content/en/profile.json": buildProfile(),
        "content/es/profile.json": buildProfile()
    })
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
    vi.unstubAllEnvs()
    window.history.pushState({}, "", "/")
})

describe("routes", () => {
    it("renderiza o header e o footer do MainLayout ao redor da página em uma rota válida", async () => {
        renderRoutes(["/pt-BR"])

        expect(
            await screen.findByRole(
                "heading",
                { name: "Desenvolvedor full stack em TypeScript" },
                { timeout: 5000 }
            )
        ).toBeInTheDocument()
        expect(screen.getByRole("banner")).toBeInTheDocument()
        expect(screen.getByRole("contentinfo")).toBeInTheDocument()
    })

    it.each([
        ["/pt-BR", "Desenvolvedor full stack em TypeScript", "pt-BR"],
        ["/en", "Full stack developer in TypeScript", "en"],
        ["/es", "Desarrollador full stack en TypeScript", "es"]
    ])("renderiza a Início em %s com o idioma do prefixo", async (path, heading, language) => {
        renderRoutes([path])

        expect(await screen.findByRole("heading", { name: heading })).toBeInTheDocument()
        expect(document.documentElement.lang).toBe(language)
    })

    it.each([["/fr/projects"], ["/pt/projects"], ["/projects"]])(
        "renderiza a não encontrada em inglês em %s",
        async (path) => {
            renderRoutes([path])

            expect(
                await screen.findByRole("heading", { name: "Page not found" })
            ).toBeInTheDocument()
            expect(document.documentElement.lang).toBe("en")
        }
    )

    it.each([["/fr/projects"], ["/projects"], ["/pt-BR/inexistente"]])(
        "renderiza a não encontrada em %s dentro do layout com cabeçalho e sem rodapé",
        async (path) => {
            renderRoutes([path])

            expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
                /Page not found|Página não encontrada/
            )
            expect(screen.getByRole("banner")).toBeInTheDocument()
            expect(screen.queryByRole("contentinfo")).not.toBeInTheDocument()
            expect(
                screen.getByRole("link", { name: /Ver projetos|View projects/ })
            ).toBeInTheDocument()
        }
    )

    it("renderiza a não encontrada em inglês em /en/inexistente", async () => {
        renderRoutes(["/en/inexistente"])

        expect(await screen.findByRole("heading", { name: "Page not found" })).toBeInTheDocument()
    })

    it("renderiza a não encontrada em português em /pt-BR/inexistente", async () => {
        renderRoutes(["/pt-BR/inexistente"])

        expect(
            await screen.findByRole("heading", { name: "Página não encontrada" })
        ).toBeInTheDocument()
    })

    it("leva o link de volta da não encontrada em /en/x para /en", async () => {
        const user = userEvent.setup()
        const router = renderRoutes(["/en/x"])

        await user.click(await screen.findByRole("link", { name: "Back to home" }))

        expect(router.state.location.pathname).toBe("/en")
        expect(
            await screen.findByRole("heading", { name: "Full stack developer in TypeScript" })
        ).toBeInTheDocument()
    })

    it("troca o texto ao navegar de /en para /es sem reload", async () => {
        const router = renderRoutes(["/en"])
        await screen.findByRole("heading", { name: "Full stack developer in TypeScript" })

        await act(async () => {
            await router.navigate("/es")
        })

        expect(
            await screen.findByRole("heading", { name: "Desarrollador full stack en TypeScript" })
        ).toBeInTheDocument()
        expect(document.documentElement.lang).toBe("es")
    })

    describe("raiz", () => {
        it.each([
            ["es", "/es"],
            ["pt-BR", "/pt-BR"],
            ["en", "/en"]
        ])("redireciona para o idioma salvo %s", async (saved, expected) => {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, saved)
            stubBrowser(["fr-FR"])
            const router = renderRoutes(["/"])

            await screen.findByRole("banner")

            expect(router.state.location.pathname).toBe(expected)
        })

        it("segue o navegador pt-PT sem escolha salva", async () => {
            stubBrowser(["pt-PT"])
            const router = renderRoutes(["/"])

            await screen.findByRole("banner")

            expect(router.state.location.pathname).toBe("/pt-BR")
        })

        it("cai em /en sem escolha salva e com o navegador em fr", async () => {
            stubBrowser(["fr-FR"])
            const router = renderRoutes(["/"])

            await screen.findByRole("banner")

            expect(router.state.location.pathname).toBe("/en")
        })

        it("faz a escolha salva vencer o navegador", async () => {
            localStorage.setItem(LANGUAGE_STORAGE_KEY, "es")
            stubBrowser(["en-US"])
            const router = renderRoutes(["/"])

            await screen.findByRole("banner")

            expect(router.state.location.pathname).toBe("/es")
        })

        it("preserva a query ao redirecionar", async () => {
            stubBrowser(["en-US"])
            const router = renderRoutes(["/?utm=x"])

            await screen.findByRole("banner")

            expect(router.state.location.pathname).toBe("/en")
            expect(router.state.location.search).toBe("?utm=x")
        })

        it("ignora o ?lng= sem gravar a chave e segue o navegador", async () => {
            stubBrowser(["en-US"])
            const router = renderRoutes(["/?lng=es"])

            await screen.findByRole("banner")

            expect(router.state.location.pathname).toBe("/en")
            expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
        })

        it("ignora o ?lng= em /pt-BR", async () => {
            const router = renderRoutes(["/pt-BR?lng=es"])

            await screen.findByRole("heading", {
                name: "Desenvolvedor full stack em TypeScript"
            })

            expect(router.state.location.pathname).toBe("/pt-BR")
            expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
        })
    })
})
