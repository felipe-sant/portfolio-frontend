import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import FilterGroup from "@/components/FilterGroup"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const options = [
    { value: "", label: "Todos" },
    { value: "web", label: "Web" },
    { value: "api", label: "API" }
]

function renderGroup(value: string | undefined, onChange = vi.fn()) {
    return render(<FilterGroup label="Tipo" options={options} value={value} onChange={onChange} />)
}

describe("FilterGroup", () => {
    it("renderiza o grupo com um botão quando há uma só opção", () => {
        render(
            <FilterGroup
                label="Categoria"
                options={[{ value: "academic", label: "Acadêmicos" }]}
                value={undefined}
                onChange={vi.fn()}
            />
        )

        expect(screen.getByRole("group", { name: "Categoria" })).toBeInTheDocument()
        expect(screen.getAllByRole("button")).toHaveLength(1)
    })

    it("é um grupo com o nome acessível igual ao rótulo", () => {
        renderGroup("")

        expect(screen.getByRole("group", { name: "Tipo" })).toBeInTheDocument()
    })

    it("marca só o botão ativo com aria-pressed", () => {
        renderGroup("web")

        expect(screen.getByRole("button", { name: "Web" })).toHaveAttribute("aria-pressed", "true")
        expect(screen.getByRole("button", { name: "Todos" })).toHaveAttribute(
            "aria-pressed",
            "false"
        )
        expect(screen.getByRole("button", { name: "API" })).toHaveAttribute("aria-pressed", "false")
    })

    it("não marca nenhum botão sem opção ativa", () => {
        renderGroup(undefined)

        for (const button of screen.getAllByRole("button")) {
            expect(button).toHaveAttribute("aria-pressed", "false")
        }
    })

    it("chama onChange com o valor da opção, inclusive da ativa", async () => {
        const onChange = vi.fn()
        renderGroup("web", onChange)

        await userEvent.click(screen.getByRole("button", { name: "API" }))
        await userEvent.click(screen.getByRole("button", { name: "Web" }))

        expect(onChange).toHaveBeenNthCalledWith(1, "api")
        expect(onChange).toHaveBeenNthCalledWith(2, "web")
    })

    it("alcança cada botão por Tab e ativa com Enter e Espaço", async () => {
        const onChange = vi.fn()
        renderGroup("", onChange)

        await userEvent.tab()
        expect(screen.getByRole("button", { name: "Todos" })).toHaveFocus()
        await userEvent.tab()
        expect(screen.getByRole("button", { name: "Web" })).toHaveFocus()
        await userEvent.keyboard("{Enter}")
        await userEvent.tab()
        expect(screen.getByRole("button", { name: "API" })).toHaveFocus()
        await userEvent.keyboard(" ")

        expect(onChange).toHaveBeenNthCalledWith(1, "web")
        expect(onChange).toHaveBeenNthCalledWith(2, "api")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderGroup("web")

        await expectNoAxeViolations(container)
    }, 15000)
})
