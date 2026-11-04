import { describe, expect, it, vi } from "vitest"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProjectError from "@/components/ProjectError"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function renderError(onRetry = vi.fn(), path = "/pt-BR/projects/x") {
    const router = createMemoryRouter(
        [{ path: "/:lang/projects/:id", element: <ProjectError onRetry={onRetry} /> }],
        { initialEntries: [path] }
    )

    return render(<RouterProvider router={router} />)
}

describe("ProjectError", () => {
    it("mostra o alerta com h1, descrição, tentar novamente e link para a lista", () => {
        renderError()
        const alert = screen.getByRole("alert")

        expect(alert).toContainElement(
            screen.getByRole("heading", { level: 1, name: "Não consegui carregar este projeto" })
        )
        expect(
            screen.getByText(
                "Os dados do projeto não chegaram. O restante do site continua funcionando."
            )
        ).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Ver outros projetos" })).toHaveAttribute(
            "href",
            "/pt-BR/projects"
        )
    })

    it("chama onRetry ao clicar em Tentar novamente", async () => {
        const onRetry = vi.fn()
        renderError(onRetry)

        await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }))

        expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it.each([
        ["en", "I couldn't load this project"],
        ["es", "No pude cargar este proyecto"]
    ] as const)("traduz o texto em %s", async (language, heading) => {
        await setLanguage(language)
        renderError(vi.fn(), `/${language}/projects/x`)

        expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: /.+/ })).toHaveAttribute(
            "href",
            `/${language}/projects`
        )
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderError()

        await expectNoAxeViolations(container)
    }, 15000)
})
