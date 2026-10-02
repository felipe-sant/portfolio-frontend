import { describe, expect, it, vi } from "vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import routes from "@/routers/routes"

function renderRoutes(initialEntries: string[]) {
    const router = createMemoryRouter(routes, { initialEntries })
    return render(<RouterProvider router={router} />)
}

describe("routes", () => {
    it("mostra o fallback de carregamento antes da página lazy resolver", async () => {
        vi.resetModules()
        const { default: freshRoutes } = await import("@/routers/routes")
        const router = createMemoryRouter(freshRoutes, { initialEntries: ["/"] })

        render(<RouterProvider router={router} />)

        expect(screen.getByText("Carregando...")).toBeInTheDocument()
    })

    it("renderiza o header e o footer do MainLayout ao redor da página em uma rota válida", async () => {
        renderRoutes(["/"])

        expect(
            await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript." })
        ).toBeInTheDocument()
        expect(screen.getByRole("banner")).toBeInTheDocument()
        expect(screen.getByRole("contentinfo")).toBeInTheDocument()
    })

    it("renderiza a página de NotFound em uma rota inexistente", async () => {
        renderRoutes(["/rota-que-nao-existe"])

        expect(
            await screen.findByRole("heading", { name: "Página não encontrada" })
        ).toBeInTheDocument()
    })

    it("navega da NotFound para a Home ao clicar no link, sem full reload", async () => {
        const user = userEvent.setup()
        renderRoutes(["/rota-que-nao-existe"])

        await screen.findByRole("link", { name: "Voltar para o início" })
        await user.click(screen.getByRole("link", { name: "Voltar para o início" }))

        expect(
            await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript." })
        ).toBeInTheDocument()
    })
})
