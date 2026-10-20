import { lazy } from "react"
import { describe, expect, it } from "vitest"
import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import MainLayout from "@/layouts/Main.layout"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import createLanguageLoader from "@/routers/createLanguageLoader"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const NeverResolves = lazy(() => new Promise<never>(() => {}))

function createRoutes(page = <h1>Conteúdo da rota</h1>) {
    return SUPPORTED_LANGUAGES.map((language) => ({
        path: language,
        element: <MainLayout />,
        loader: createLanguageLoader(language),
        children: [
            { index: true, element: page },
            { path: "projects", element: <h1>Projetos da rota</h1> },
            { path: "*", element: <h1>Não encontrada</h1> }
        ]
    }))
}

async function renderLayout(entry = "/pt-BR", page?: React.JSX.Element) {
    const router = createMemoryRouter(createRoutes(page), { initialEntries: [entry] })
    const utils = render(<RouterProvider router={router} />)
    await screen.findByRole("banner")
    return { router, ...utils }
}

describe("MainLayout", () => {
    it("não tem violações de acessibilidade", async () => {
        const { container } = await renderLayout()

        await expectNoAxeViolations(container)
    }, 15000)

    it("renderiza header, footer e a rota filha", async () => {
        await renderLayout()

        expect(screen.getByRole("banner")).toBeInTheDocument()
        expect(screen.getByRole("contentinfo")).toHaveTextContent("© 2026 · Luiz Felipe dos Santos")
        expect(screen.getByRole("heading", { name: "Conteúdo da rota" })).toBeInTheDocument()
    })

    it("tem um único main com id", async () => {
        await renderLayout()

        expect(screen.getAllByRole("main")).toHaveLength(1)
        expect(screen.getByRole("main")).toHaveAttribute("id", "main-content")
        expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1")
    })

    it("tem o link Pular para o conteúdo como primeiro foco e leva ao main", async () => {
        await renderLayout()

        await userEvent.tab()
        const skip = screen.getByRole("link", { name: "Pular para o conteúdo" })

        expect(skip).toHaveFocus()
        expect(skip).toHaveAttribute("href", "#main-content")
    })

    it("aplica inert no skip link, main e rodapé com o menu aberto e remove ao fechar", async () => {
        await renderLayout()
        const button = screen.getByRole("button", { name: "Menu" })
        const skip = screen.getByRole("link", { name: "Pular para o conteúdo", hidden: true })

        await userEvent.click(button)

        expect(skip).toHaveAttribute("inert")
        expect(document.getElementById("main-content")).toHaveAttribute("inert")
        expect(document.querySelector("footer")).toHaveAttribute("inert")

        await userEvent.click(button)

        expect(skip).not.toHaveAttribute("inert")
        expect(document.getElementById("main-content")).not.toHaveAttribute("inert")
        expect(document.querySelector("footer")).not.toHaveAttribute("inert")
    })

    it("marca Início ativo em /pt-BR", async () => {
        await renderLayout("/pt-BR")
        const nav = screen.getAllByRole("navigation", { name: "Principal", hidden: true })[0]

        expect(within(nav).getByRole("link", { current: "page" })).toHaveTextContent("Início")
    })

    it("marca Projetos ativo em /pt-BR/projects", async () => {
        await renderLayout("/pt-BR/projects")
        const nav = screen.getAllByRole("navigation", { name: "Principal", hidden: true })[0]

        expect(within(nav).getByRole("link", { current: "page" })).toHaveTextContent("Projetos")
    })

    it("não marca item em rota desconhecida", async () => {
        await renderLayout("/pt-BR/desconhecida")

        expect(screen.queryAllByRole("link", { current: "page", hidden: true })).toHaveLength(0)
    })

    it("mantém o prefixo do idioma nos links do cabeçalho em /en", async () => {
        await renderLayout("/en")
        const nav = screen.getAllByRole("navigation", { name: "Main", hidden: true })[0]

        expect(within(nav).getByRole("link", { name: "Projects" })).toHaveAttribute(
            "href",
            "/en/projects"
        )
    })

    it("troca de idioma pelo seletor atualizando html lang e preservando query e âncora", async () => {
        const { router } = await renderLayout("/pt-BR/projects?q=a#topo")

        await userEvent.click(screen.getAllByRole("button", { name: "Idioma: Português" })[0])
        await userEvent.click(screen.getByRole("link", { name: "Español" }))

        expect(router.state.location.pathname).toBe("/es/projects")
        expect(router.state.location.search).toBe("?q=a")
        expect(router.state.location.hash).toBe("#topo")
        expect(document.documentElement).toHaveAttribute("lang", "es")
        expect((await screen.findAllByRole("button", { name: "Idioma: Español" }))[0]).toHaveFocus()
    })

    it("foca o h1 na navegação interna", async () => {
        const { router } = await renderLayout("/pt-BR")

        await act(async () => {
            await router.navigate("/pt-BR/projects")
        })

        expect(screen.getByRole("heading", { name: "Projetos da rota" })).toHaveFocus()
    })

    it("mostra o fallback no lugar do Outlet sem esconder header e footer", async () => {
        await renderLayout("/pt-BR", <NeverResolves />)

        expect(screen.getByRole("status")).toHaveTextContent("Carregando...")
        expect(screen.getByRole("banner")).toBeInTheDocument()
        expect(screen.getByRole("contentinfo")).toBeInTheDocument()
    })
})
