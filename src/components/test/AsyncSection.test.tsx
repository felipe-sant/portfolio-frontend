import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AsyncSection from "@/components/AsyncSection"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function renderSection(
    props: { isLoading?: boolean; isError?: boolean; announce?: boolean; id?: string } = {},
    onRetry = vi.fn()
) {
    const { isLoading = false, isError = false, announce, id } = props

    return render(
        <AsyncSection
            isLoading={isLoading}
            isError={isError}
            skeleton={<div data-testid="skeleton" />}
            error={{
                title: "Não foi possível carregar",
                retryLabel: "Tentar de novo",
                onRetry,
                announce,
                id
            }}
        >
            <p>Conteúdo</p>
        </AsyncSection>
    )
}

describe("AsyncSection", () => {
    it("mostra só o esqueleto enquanto carrega", () => {
        renderSection({ isLoading: true, isError: true })

        expect(screen.getByTestId("skeleton")).toBeInTheDocument()
        expect(screen.queryByText("Conteúdo")).not.toBeInTheDocument()
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("mostra só o conteúdo quando não carrega nem falha", () => {
        renderSection()

        expect(screen.getByText("Conteúdo")).toBeInTheDocument()
        expect(screen.queryByTestId("skeleton")).not.toBeInTheDocument()
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it("mostra o erro antes do conteúdo e chama onRetry no botão", async () => {
        const onRetry = vi.fn()
        renderSection({ isError: true }, onRetry)

        const alert = screen.getByRole("alert")
        const content = screen.getByText("Conteúdo")

        expect(alert).toHaveTextContent("Não foi possível carregar")
        expect(alert.compareDocumentPosition(content)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)

        await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }))

        expect(onRetry).toHaveBeenCalledTimes(1)
    })

    it("repassa o id ao erro", () => {
        renderSection({ isError: true, id: "erro-id" })

        expect(screen.getByRole("alert")).toHaveAttribute("id", "erro-id")
    })

    it("não anuncia o erro com announce falso", () => {
        renderSection({ isError: true, announce: false })

        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
        expect(screen.getByText("Não foi possível carregar")).toBeInTheDocument()
    })

    it.each([{ isLoading: true }, { isError: true }, {}])(
        "não tem violações de acessibilidade com %o",
        async (props) => {
            const { container } = renderSection(props)

            await expectNoAxeViolations(container)
        }
    )
})
