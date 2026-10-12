import { lazy } from "react"
import { describe, expect, it } from "vitest"
import { MemoryRouter, Route, Routes as Switch } from "react-router-dom"
import { render, screen, within } from "@testing-library/react"
import MainLayout from "@/layouts/Main.layout"

const NeverResolves = lazy(() => new Promise<never>(() => {}))

function renderLayout() {
    render(
        <MemoryRouter initialEntries={["/"]}>
            <Switch>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<p>Conteúdo da rota</p>} />
                </Route>
            </Switch>
        </MemoryRouter>
    )
}

describe("MainLayout", () => {
    it("renderiza o header e o footer", () => {
        renderLayout()

        const brandLink = within(screen.getByRole("banner")).getByRole("link", {
            name: "Luiz Felipe"
        })

        expect(brandLink).toHaveAttribute("href", "/")
        expect(screen.getByRole("contentinfo")).toHaveTextContent("© 2026 · Luiz Felipe dos Santos")
    })

    it("renderiza a rota filha no lugar do Outlet", () => {
        renderLayout()

        expect(screen.getByText("Conteúdo da rota")).toBeInTheDocument()
    })

    it("mostra o fallback no lugar do Outlet sem esconder header e footer", () => {
        render(
            <MemoryRouter initialEntries={["/"]}>
                <Switch>
                    <Route element={<MainLayout />}>
                        <Route path="/" element={<NeverResolves />} />
                    </Route>
                </Switch>
            </MemoryRouter>
        )

        expect(screen.getByText("Carregando...")).toBeInTheDocument()
        expect(screen.getByRole("banner")).toBeInTheDocument()
        expect(screen.getByRole("contentinfo")).toBeInTheDocument()
    })
})
