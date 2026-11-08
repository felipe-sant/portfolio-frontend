import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoadError from "@/components/LoadError"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function renderLoadError(onRetry = vi.fn(), id = "alert-id") {
    return render(
        <LoadError
            title="Não foi possível carregar"
            description="Tente de novo em instantes."
            retryLabel="Tentar de novo"
            onRetry={onRetry}
            id={id}
        />
    )
}

describe("LoadError", () => {
    it("renderiza o alerta com título e descrição", () => {
        renderLoadError()

        expect(screen.getByRole("alert")).toBeInTheDocument()
        expect(screen.getByText("Não foi possível carregar")).toBeInTheDocument()
        expect(screen.getByText("Tente de novo em instantes.")).toBeInTheDocument()
    })

    it("chama onRetry ao clicar no botão", async () => {
        const onRetry = vi.fn()
        renderLoadError(onRetry)

        await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }))

        expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it("aplica o id e aceita foco programático", () => {
        renderLoadError(vi.fn(), "alert-id")

        const alert = screen.getByRole("alert")

        expect(alert).toHaveAttribute("id", "alert-id")

        alert.focus()

        expect(document.activeElement).toBe(alert)
    })

    it("não renderiza o parágrafo de descrição quando ela não é passada", () => {
        const { container } = render(
            <LoadError title="Sem descrição" retryLabel="Tentar de novo" onRetry={vi.fn()} />
        )

        expect(screen.getByText("Sem descrição")).toBeInTheDocument()
        expect(container.querySelectorAll("p")).toHaveLength(1)
    })

    it("não tem violações de acessibilidade sem descrição", async () => {
        const { container } = render(
            <LoadError title="Sem descrição" retryLabel="Tentar de novo" onRetry={vi.fn()} />
        )

        await expectNoAxeViolations(container)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderLoadError()

        await expectNoAxeViolations(container)
    })
    it("mantém role alert, tabIndex e id quando announce não é passada", () => {
        renderLoadError(vi.fn(), "alert-id")

        const alert = screen.getByRole("alert")

        expect(alert).toHaveAttribute("tabindex", "-1")
        expect(alert).toHaveAttribute("id", "alert-id")
    })

    it("não anuncia com announce falso e mantém a mensagem e o botão", async () => {
        const onRetry = vi.fn()
        render(
            <LoadError
                title="Não foi possível carregar"
                retryLabel="Tentar de novo"
                onRetry={onRetry}
                announce={false}
            />
        )

        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
        expect(screen.getByText("Não foi possível carregar")).toBeInTheDocument()

        await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }))

        expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it("não tem violações de acessibilidade com announce falso", async () => {
        const { container } = render(
            <LoadError
                title="Não foi possível carregar"
                retryLabel="Tentar de novo"
                onRetry={vi.fn()}
                announce={false}
            />
        )

        await expectNoAxeViolations(container)
    })
})
