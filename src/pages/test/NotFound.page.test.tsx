import { afterEach, describe, expect, it } from "vitest"
import { MemoryRouter, RouterProvider, createMemoryRouter } from "react-router-dom"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import setLanguage from "@/i18n/setLanguage"
import NotFoundPage from "@/pages/NotFound.page"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import stubViewTransition from "@/testUtils/stubViewTransition"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

function renderPage() {
    return render(
        <MemoryRouter>
            <NotFoundPage />
        </MemoryRouter>
    )
}

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

function descriptionOf() {
    return document.querySelector('meta[name="description"]')?.getAttribute("content")
}

afterEach(() => {
    Reflect.deleteProperty(document, "startViewTransition")
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("NotFoundPage", () => {
    it("não tem violações de acessibilidade", async () => {
        const { container } = renderPage()

        await expectNoAxeViolations(container)
    }, 15000)

    it("renderiza rótulo, título e texto", () => {
        renderPage()

        expect(screen.getByText("Erro 404")).toBeInTheDocument()
        expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument()
        expect(
            screen.getByText(
                "O endereço pode ter mudado ou o projeto saiu do ar. A lista completa continua em Projetos."
            )
        ).toBeInTheDocument()
    })

    it("oferece os links para Projetos e para o início", () => {
        renderPage()

        expect(screen.getByRole("link", { name: "Ver projetos" })).toHaveAttribute(
            "href",
            "/pt-BR/projects"
        )
        expect(screen.getByRole("link", { name: "Voltar para o início" })).toHaveAttribute(
            "href",
            "/pt-BR"
        )
    })

    it("não aplica atributo class no heading", () => {
        renderPage()

        expect(screen.getByRole("heading", { name: "Página não encontrada" })).not.toHaveAttribute(
            "class"
        )
    })

    it("traduz o conteúdo e prefixa os links em en e es", async () => {
        renderPage()

        await act(() => setLanguage("en"))

        expect(screen.getByRole("heading", { name: "Page not found" })).toBeInTheDocument()
        expect(screen.getByText("Error 404")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "View projects" })).toHaveAttribute(
            "href",
            "/en/projects"
        )
        expect(screen.getByRole("link", { name: "Back to home" })).toHaveAttribute("href", "/en")

        await act(() => setLanguage("es"))

        expect(screen.getByRole("heading", { name: "Página no encontrada" })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Ver proyectos" })).toHaveAttribute(
            "href",
            "/es/projects"
        )
        expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute(
            "href",
            "/es"
        )
    })

    it("define title e meta description em pt-BR, en e es", async () => {
        renderPage()

        expect(document.title).toBe("Página não encontrada · Luiz Felipe dos Santos")
        expect(descriptionOf()).toBe("O endereço acessado não existe neste portfólio.")

        await act(() => setLanguage("en"))

        expect(document.title).toBe("Page not found · Luiz Felipe dos Santos")
        expect(descriptionOf()).toBe("The address you opened does not exist in this portfolio.")

        await act(() => setLanguage("es"))

        expect(document.title).toBe("Página no encontrada · Luiz Felipe dos Santos")
        expect(descriptionOf()).toBe(
            "La dirección a la que accediste no existe en este portafolio."
        )
    })

    it("marca a página como noindex e não declara canônica, hreflang nem Open Graph", () => {
        renderPage()

        expect(document.querySelector('meta[name="robots"]')).toHaveAttribute("content", "noindex")
        expect(document.querySelector('link[rel="canonical"]')).toBeNull()
        expect(document.querySelector("link[hreflang]")).toBeNull()
        expect(document.querySelector('meta[property^="og:"]')).toBeNull()
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
