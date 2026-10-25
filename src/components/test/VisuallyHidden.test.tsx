import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import VisuallyHidden from "@/components/VisuallyHidden"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("VisuallyHidden", () => {
    it("mantém o texto na árvore de acessibilidade", () => {
        render(<VisuallyHidden>Texto para leitor de tela</VisuallyHidden>)

        expect(screen.getByText("Texto para leitor de tela")).toBeInTheDocument()
    })

    it("renderiza span por padrão e div com as div", () => {
        const { rerender } = render(<VisuallyHidden>Oculto</VisuallyHidden>)

        expect(screen.getByText("Oculto").tagName).toBe("SPAN")

        rerender(<VisuallyHidden as="div">Oculto</VisuallyHidden>)

        expect(screen.getByText("Oculto").tagName).toBe("DIV")
    })

    it("expõe o role recebido", () => {
        render(<VisuallyHidden role={"status"}>Carregando...</VisuallyHidden>)

        expect(screen.getByRole("status")).toHaveTextContent("Carregando...")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<VisuallyHidden>Texto oculto</VisuallyHidden>)

        await expectNoAxeViolations(container)
    }, 15000)
})
