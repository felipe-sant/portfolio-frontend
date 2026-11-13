import { describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import ProjectsSummary from "@/components/ProjectsSummary"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("ProjectsSummary", () => {
    it("mostra o texto dentro da região de status", () => {
        render(<ProjectsSummary text="9 de 12 projetos" canClear={false} onClear={vi.fn()} />)

        expect(screen.getByRole("status")).toHaveTextContent("9 de 12 projetos")
    })

    it("mantém o mesmo nó da região de status quando o texto muda", () => {
        const { rerender } = render(<ProjectsSummary text="" canClear={false} onClear={vi.fn()} />)
        const status = screen.getByRole("status")

        rerender(<ProjectsSummary text="9 de 12 projetos" canClear onClear={vi.fn()} />)

        expect(screen.getByRole("status")).toBe(status)
        expect(status).toHaveTextContent("9 de 12 projetos")
    })

    it("sem canClear não renderiza o botão Limpar filtros", () => {
        render(<ProjectsSummary text="9 de 12 projetos" canClear={false} onClear={vi.fn()} />)

        expect(screen.queryByRole("button", { name: "Limpar filtros" })).toBeNull()
    })

    it("com canClear o botão Limpar filtros chama onClear", async () => {
        const user = userEvent.setup()
        const onClear = vi.fn()

        render(<ProjectsSummary text="3 de 12 projetos" canClear onClear={onClear} />)

        await user.click(screen.getByRole("button", { name: "Limpar filtros" }))

        expect(onClear).toHaveBeenCalledTimes(1)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(
            <ProjectsSummary text="3 de 12 projetos" canClear onClear={vi.fn()} />
        )

        await expectNoAxeViolations(container)
    })
})
