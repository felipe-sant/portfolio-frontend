import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter, RouterProvider, createMemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import NotFoundPage from "@/pages/NotFound.page"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import stubViewTransition from "@/testUtils/stubViewTransition"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

function renderInDataRouter() {
    const router = createMemoryRouter(
        [
            { path: "/pt-BR/missing", element: <NotFoundPage /> },
            { path: "/pt-BR", element: <p>Início</p> }
        ],
        { initialEntries: ["/pt-BR/missing"] }
    )

    return render(<RouterProvider router={router} />)
}

afterEach(() => {
    Reflect.deleteProperty(document, "startViewTransition")
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("NotFoundPage", () => {
    it("não tem violações de acessibilidade", async () => {
        const { container } = render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        )

        await expectNoAxeViolations(container)
    }, 15000)

    it("renderiza o título de página não encontrada", () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument()
    })

    it("oferece um link de volta para a página inicial", () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("link", { name: "Voltar para o início" })).toHaveAttribute(
            "href",
            "/pt-BR"
        )
    })

    it("não aplica atributo class no heading", () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Página não encontrada" })).not.toHaveAttribute(
            "class"
        )
    })

    it("define o title e a meta description da página", () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        )

        expect(document.title).toBe("Página não encontrada · Luiz Felipe dos Santos")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "O endereço acessado não existe neste portfólio."
        )
    })

    it("usa View Transition ao voltar para o início com movimento pleno", async () => {
        const startViewTransition = stubViewTransition()
        renderInDataRouter()

        await userEvent.click(screen.getByRole("link", { name: "Voltar para o início" }))

        expect(startViewTransition).toHaveBeenCalledTimes(1)
    })

    it("não usa View Transition com movimento reduzido", async () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        const startViewTransition = stubViewTransition()
        renderInDataRouter()

        await userEvent.click(screen.getByRole("link", { name: "Voltar para o início" }))

        expect(startViewTransition).not.toHaveBeenCalled()
    })
})
