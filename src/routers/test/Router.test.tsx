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

        expect(await screen.findByRole("heading", { name: "Olá, mundo!" })).toBeInTheDocument()
        expect(screen.getByRole("banner")).toBeInTheDocument()
        expect(screen.getByRole("contentinfo")).toBeInTheDocument()
    })

    it("renderiza a página de NotFound em uma rota inexistente", async () => {
        renderRoutes(["/rota-que-nao-existe"])

        expect(
            await screen.findByRole("heading", { name: "404 - Página não encontrada" })
        ).toBeInTheDocument()
    })

    it("navega da NotFound para a Home ao clicar no link, sem full reload", async () => {
        const user = userEvent.setup()
        renderRoutes(["/rota-que-nao-existe"])

        await screen.findByRole("link", { name: "Vá para a página inicial." })
        await user.click(screen.getByRole("link", { name: "Vá para a página inicial." }))

        expect(await screen.findByRole("heading", { name: "Olá, mundo!" })).toBeInTheDocument()
    })
})
