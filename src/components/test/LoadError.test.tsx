import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import LoadError from "@/components/LoadError"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function renderLoadError(onRetry = vi.fn(), ref = createRef<HTMLDivElement>()) {
    return render(
        <LoadError
            title="Não foi possível carregar"
            description="Tente de novo em instantes."
            retryLabel="Tentar de novo"
            onRetry={onRetry}
            ref={ref}
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

    it("entrega o elemento no ref e aceita foco programático", () => {
        const ref = createRef<HTMLDivElement>()
        renderLoadError(vi.fn(), ref)

        expect(ref.current).toBe(screen.getByRole("alert"))

        ref.current?.focus()

        expect(document.activeElement).toBe(ref.current)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderLoadError()

        await expectNoAxeViolations(container)
    }, 15000)
})
