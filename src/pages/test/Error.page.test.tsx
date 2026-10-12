import { describe, expect, it } from "vitest"
import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import ErrorPage from "@/pages/Error.page"

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

describe("ErrorPage", () => {
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
            "/"
        )
    })

    it("define o title e a meta description da página", () => {
        renderErrorPage()

        expect(document.title).toBe("Erro inesperado · Luiz Felipe dos Santos")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Algo deu errado ao carregar esta página."
        )
    })
})
