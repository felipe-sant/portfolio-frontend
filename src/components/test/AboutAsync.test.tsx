import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AboutAsync from "@/components/AboutAsync"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function renderAsync(props: { isLoading?: boolean; isError?: boolean; announce?: boolean }) {
    const onRetry = vi.fn()
    const result = render(
        <AboutAsync
            isLoading={props.isLoading ?? false}
            isError={props.isError ?? false}
            announce={props.announce}
            errorId="erro"
            onRetry={onRetry}
            skeleton={<div data-testid="skeleton" />}
        >
            <p>Conteúdo</p>
        </AboutAsync>
    )

    return { ...result, onRetry }
}

describe("AboutAsync", () => {
    it("mostra o esqueleto enquanto carrega", () => {
        renderAsync({ isLoading: true })

        expect(screen.getByTestId("skeleton")).toBeInTheDocument()
        expect(screen.queryByText("Conteúdo")).not.toBeInTheDocument()
    })

    it("mostra o conteúdo quando carregou", () => {
        renderAsync({})

        expect(screen.getByText("Conteúdo")).toBeInTheDocument()
    })

    it("mostra a mensagem de erro de Informações sem anunciar por padrão", async () => {
        const { onRetry } = renderAsync({ isError: true })

        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
        expect(
            screen.getByText("Não foi possível carregar esta parte da página.")
        ).toBeInTheDocument()

        await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }))

        expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it("anuncia o erro com announce e aplica o id", () => {
        renderAsync({ isError: true, announce: true })

        expect(screen.getByRole("alert")).toHaveAttribute("id", "erro")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderAsync({ isError: true, announce: true })

        await expectNoAxeViolations(container)
    })
})
