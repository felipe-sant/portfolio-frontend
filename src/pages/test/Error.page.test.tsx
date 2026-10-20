import { afterEach, describe, expect, it } from "vitest"
import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ErrorPage from "@/pages/Error.page"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import stubViewTransition from "@/testUtils/stubViewTransition"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

function ThrowingPage(): never {
    throw new Error("Falha proposital de teste")
}

function ThrowingNonErrorPage(): never {
    throw "falha que não é um Error"
}

function renderErrorPage(Page: () => never = ThrowingPage) {
    const router = createMemoryRouter(
        [{ path: "/", element: <Page />, errorElement: <ErrorPage /> }],
        { initialEntries: ["/"] }
    )

    return render(<RouterProvider router={router} />)
}

afterEach(() => {
    Reflect.deleteProperty(document, "startViewTransition")
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("ErrorPage", () => {
    it("não tem violações de acessibilidade", async () => {
        const { container } = renderErrorPage()

        await expectNoAxeViolations(container)
    }, 15000)

    it("renderiza o heading genérico de erro e a mensagem da exceção lançada", () => {
        renderErrorPage()

        expect(screen.getByRole("heading", { name: "Erro inesperado" })).toBeInTheDocument()
        expect(screen.getByText("Falha proposital de teste")).toBeInTheDocument()
    })

    it("mostra a mensagem genérica quando o valor lançado não é um Error", () => {
        renderErrorPage(ThrowingNonErrorPage)

        expect(screen.getByText("Erro desconhecido.")).toBeInTheDocument()
    })

    it("oferece um link de volta para a página inicial", () => {
        renderErrorPage()

        expect(screen.getByRole("link", { name: "Voltar para o início" })).toHaveAttribute(
            "href",
            "/pt-BR"
        )
    })

    it("define o title e a meta description da página", () => {
        renderErrorPage()

        expect(document.title).toBe("Erro inesperado · Luiz Felipe dos Santos")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Algo deu errado ao carregar esta página."
        )
    })

    it("usa View Transition ao voltar para o início com movimento pleno", async () => {
        const startViewTransition = stubViewTransition()
        renderErrorPage()

        await userEvent.click(screen.getByRole("link", { name: "Voltar para o início" }))

        expect(startViewTransition).toHaveBeenCalledTimes(1)
    })

    it("não usa View Transition com movimento reduzido", async () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        const startViewTransition = stubViewTransition()
        renderErrorPage()

        await userEvent.click(screen.getByRole("link", { name: "Voltar para o início" }))

        expect(startViewTransition).not.toHaveBeenCalled()
    })
})
