import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { RouterProvider, createMemoryRouter } from "react-router-dom"
import { act, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import setLanguage from "@/i18n/setLanguage"
import ErrorPage from "@/pages/Error.page"
import buildProfile from "@/testUtils/buildProfile"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"
import stubViewTransition from "@/testUtils/stubViewTransition"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"
import reloadPage from "@/utils/reloadPage"

vi.mock("@/utils/reloadPage", () => ({ default: vi.fn() }))

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

    return renderWithStore(<RouterProvider router={router} />)
}

function descriptionOf() {
    return document.querySelector('meta[name="description"]')?.getAttribute("content")
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
    Reflect.deleteProperty(document, "startViewTransition")
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("ErrorPage", () => {
    it("não tem violações de acessibilidade", async () => {
        const { container } = renderErrorPage()
        await screen.findByRole("button", { name: "Copiar e-mail" })

        await expectNoAxeViolations(container)
    }, 15000)

    it("renderiza banner, main único com id e contentinfo", async () => {
        renderErrorPage()

        expect(screen.getByRole("banner")).toBeInTheDocument()
        expect(screen.getAllByRole("main")).toHaveLength(1)
        expect(screen.getByRole("main")).toHaveAttribute("id", "main-content")
        expect(screen.getByRole("contentinfo")).toBeInTheDocument()
        await screen.findByRole("button", { name: "Copiar e-mail" })
    })

    it("tem o link Pular para o conteúdo como primeiro foco", async () => {
        renderErrorPage()

        await userEvent.tab()

        const skip = screen.getByRole("link", { name: "Pular para o conteúdo" })
        expect(skip).toHaveFocus()
        expect(skip).toHaveAttribute("href", "#main-content")
        await screen.findByRole("button", { name: "Copiar e-mail" })
    })

    it("renderiza o título, o texto e as ações", async () => {
        renderErrorPage()

        expect(screen.getByRole("heading", { name: "Erro inesperado" })).toBeInTheDocument()
        expect(
            screen.getByText(
                "Algo quebrou do meu lado, não do seu. Tente de novo em alguns segundos."
            )
        ).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Voltar para o início" })).toHaveAttribute(
            "href",
            "/pt-BR"
        )
        await screen.findByRole("button", { name: "Copiar e-mail" })
    })

    it("recarrega a página ao clicar em Tentar novamente", async () => {
        renderErrorPage()

        await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }))

        expect(reloadPage).toHaveBeenCalledTimes(1)
        await screen.findByRole("button", { name: "Copiar e-mail" })
    })

    it("não mostra a mensagem técnica de um Error", async () => {
        renderErrorPage()

        expect(screen.queryByText("Falha proposital de teste")).not.toBeInTheDocument()
        expect(screen.queryByText("Erro desconhecido.")).not.toBeInTheDocument()
        await screen.findByRole("button", { name: "Copiar e-mail" })
    })

    it("mostra a mesma página quando o valor lançado não é um Error", async () => {
        renderErrorPage(ThrowingNonErrorPage)

        expect(screen.getByRole("heading", { name: "Erro inesperado" })).toBeInTheDocument()
        expect(screen.queryByText("falha que não é um Error")).not.toBeInTheDocument()
        expect(screen.queryByText("Erro desconhecido.")).not.toBeInTheDocument()
        await screen.findByRole("button", { name: "Copiar e-mail" })
    })

    it("define title, description e noindex em pt-BR, en e es", async () => {
        renderErrorPage()

        expect(document.title).toBe("Erro inesperado · Luiz Felipe dos Santos")
        expect(descriptionOf()).toBe("Algo deu errado ao carregar esta página.")
        expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex")
        expect(document.querySelector('link[rel="canonical"]')).toBeNull()

        await act(() => setLanguage("en"))

        expect(document.title).toBe("Unexpected error · Luiz Felipe dos Santos")
        expect(descriptionOf()).toBe("Something went wrong while loading this page.")

        await act(() => setLanguage("es"))

        expect(document.title).toBe("Error inesperado · Luiz Felipe dos Santos")
        expect(descriptionOf()).toBe("Algo salió mal al cargar esta página.")
    })

    it("traduz o conteúdo em en e es", async () => {
        renderErrorPage()

        await act(() => setLanguage("en"))

        expect(screen.getByRole("heading", { name: "Unexpected error" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/en")

        await act(() => setLanguage("es"))

        expect(screen.getByRole("heading", { name: "Error inesperado" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Intentar de nuevo" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute(
            "href",
            "/es"
        )
    })

    it("não marca nenhum item do cabeçalho como atual", async () => {
        renderErrorPage()

        expect(screen.queryAllByRole("link", { current: "page", hidden: true })).toHaveLength(0)
        await screen.findByRole("button", { name: "Copiar e-mail" })
    })

    it("aplica inert no skip link, main e rodapé com o menu aberto", async () => {
        renderErrorPage()
        const skip = screen.getByRole("link", { name: "Pular para o conteúdo", hidden: true })

        await userEvent.click(screen.getByRole("button", { name: "Menu" }))

        expect(skip).toHaveAttribute("inert")
        expect(document.getElementById("main-content")).toHaveAttribute("inert")
        expect(document.querySelector("footer")).toHaveAttribute("inert")
        await act(async () => {})
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
