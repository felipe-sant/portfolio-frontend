import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import AvailabilityBadge from "@/components/AvailabilityBadge"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("AvailabilityBadge", () => {
    it("mostra o texto recebido", () => {
        render(<AvailabilityBadge label="Disponível para novos projetos" />)

        expect(screen.getByText("Disponível para novos projetos")).toBeInTheDocument()
    })

    it("esconde o indicador dos leitores de tela", () => {
        const { container } = render(<AvailabilityBadge label="Disponível" />)

        expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument()
    })

    it("não é link nem botão", () => {
        render(<AvailabilityBadge label="Disponível" />)

        expect(screen.queryByRole("link")).not.toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<AvailabilityBadge label="Disponível" />)

        await expectNoAxeViolations(container)
    }, 15000)
})
