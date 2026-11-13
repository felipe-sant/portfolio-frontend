import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import ProjectsEmptyState from "@/components/ProjectsEmptyState"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("ProjectsEmptyState", () => {
    it("mostra o título em h2 e a descrição", () => {
        render(<ProjectsEmptyState heading="Nada por aqui" description="Volte mais tarde." />)

        expect(screen.getByRole("heading", { level: 2, name: "Nada por aqui" })).toBeInTheDocument()
        expect(screen.getByText("Volte mais tarde.")).toBeInTheDocument()
    })

    it("não renderiza botão sem ação", () => {
        render(<ProjectsEmptyState heading="Nada por aqui" description="Volte mais tarde." />)

        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("renderiza a ação depois da descrição", () => {
        render(
            <ProjectsEmptyState
                heading="Nada por aqui"
                description="Volte mais tarde."
                action={<button type="button">Limpar</button>}
            />
        )

        const description = screen.getByText("Volte mais tarde.")
        const action = screen.getByRole("button", { name: "Limpar" })

        expect(description.compareDocumentPosition(action)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(
            <ProjectsEmptyState
                heading="Nada por aqui"
                description="Volte mais tarde."
                action={<button type="button">Limpar</button>}
            />
        )

        await expectNoAxeViolations(container)
    })
})
