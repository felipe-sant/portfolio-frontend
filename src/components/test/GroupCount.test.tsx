import { describe, expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import GroupCount from "@/components/GroupCount"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("GroupCount", () => {
    it.each([
        ["pt-BR", "stack.count", 1, "1 tecnologia"],
        ["pt-BR", "stack.count", 2, "2 tecnologias"],
        ["pt-BR", "trajectory.count", 1, "1 item"],
        ["pt-BR", "trajectory.count", 2, "2 itens"],
        ["en", "stack.count", 2, "2 technologies"],
        ["en", "trajectory.count", 1, "1 item"],
        ["es", "stack.count", 1, "1 tecnología"],
        ["es", "trajectory.count", 2, "2 elementos"]
    ] as const)("diz a contagem em %s com %s e %i", async (language, countKey, count, text) => {
        await act(() => setLanguage(language))
        render(<GroupCount count={count} countKey={countKey} />)

        expect(screen.getByText(text)).toBeInTheDocument()
    })

    it("mantém o número visível em aria-hidden e o texto com o substantivo oculto", () => {
        const { container } = render(<GroupCount count={4} countKey="stack.count" />)
        const visible = container.querySelector('[aria-hidden="true"]')

        expect(visible).toHaveTextContent("4")
        expect(visible?.textContent).toBe("4")
        expect(screen.getByText("4 tecnologias").closest('[aria-hidden="true"]')).toBeNull()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<GroupCount count={2} countKey="trajectory.count" />)

        await expectNoAxeViolations(container)
    }, 15000)
})
