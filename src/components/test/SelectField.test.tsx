import { describe, expect, it, vi } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SelectField from "@/components/SelectField"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const options = [
    { value: "recent", label: "Mais recente" },
    { value: "oldest", label: "Mais antigo" },
    { value: "title", label: "A–Z" }
]

function renderSelect(value = "recent", onChange = vi.fn(), items = options) {
    return render(<SelectField label="Ordenar" options={items} value={value} onChange={onChange} />)
}

function getTrigger(name = "Ordenar Mais recente") {
    return screen.getByRole("button", { name })
}

describe("SelectField", () => {
    it("abre e lista uma opção quando há uma só", async () => {
        const user = userEvent.setup()
        renderSelect("recent", vi.fn(), [options[0]])

        await user.click(getTrigger())

        expect(screen.getAllByRole("option")).toHaveLength(1)
    })

    it("fechado, tem gatilho com nome, popup de lista e nenhum listbox", () => {
        renderSelect()

        const trigger = getTrigger()

        expect(trigger).toHaveAttribute("aria-haspopup", "listbox")
        expect(trigger).toHaveAttribute("aria-expanded", "false")
        expect(trigger).not.toHaveAttribute("aria-controls")
        expect(screen.queryByRole("listbox")).not.toBeInTheDocument()
        expect(screen.getByText("Ordenar")).toBeVisible()
    })

    it("abre pelo clique com o listbox, as opções e o foco na opção atual", async () => {
        const user = userEvent.setup()
        renderSelect("oldest")

        await user.click(getTrigger("Ordenar Mais antigo"))

        const trigger = getTrigger("Ordenar Mais antigo")
        const listbox = screen.getByRole("listbox", { name: "Ordenar" })
        const items = screen.getAllByRole("option")

        expect(trigger).toHaveAttribute("aria-expanded", "true")
        expect(trigger).toHaveAttribute("aria-controls", listbox.id)
        expect(items.map((item) => item.textContent)).toEqual([
            "Mais recente",
            "Mais antigo",
            "A–Z"
        ])
        expect(items.map((item) => item.getAttribute("aria-selected"))).toEqual([
            "false",
            "true",
            "false"
        ])
        expect(new Set(items.map((item) => item.id)).size).toBe(3)
        expect(items[1]).toHaveFocus()
    })

    it("escolhe outra opção pelo clique, chama onChange uma vez, fecha e devolve o foco ao gatilho", async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        renderSelect("recent", onChange)

        await user.click(getTrigger())
        await user.click(screen.getByRole("option", { name: "A–Z" }))

        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith("title")
        expect(getTrigger()).toHaveAttribute("aria-expanded", "false")
        expect(getTrigger()).toHaveFocus()
        await waitFor(() => expect(screen.queryByRole("listbox")).not.toBeInTheDocument())
    })

    it("escolher a opção atual fecha sem chamar onChange", async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        renderSelect("recent", onChange)

        await user.click(getTrigger())
        await user.click(screen.getByRole("option", { name: "Mais recente" }))

        expect(onChange).not.toHaveBeenCalled()
        expect(getTrigger()).toHaveAttribute("aria-expanded", "false")
    })

    it.each([["{Enter}"], [" "], ["{ArrowDown}"], ["{ArrowUp}"]])(
        "abre pelo teclado com %j no gatilho e foca a opção atual",
        async (key) => {
            const user = userEvent.setup()
            renderSelect("oldest")

            getTrigger("Ordenar Mais antigo").focus()
            await user.keyboard(key)

            expect(getTrigger("Ordenar Mais antigo")).toHaveAttribute("aria-expanded", "true")
            expect(screen.getByRole("option", { name: "Mais antigo" })).toHaveFocus()
        }
    )

    it("move o foco com as setas sem dar a volta, e Home e End vão aos extremos", async () => {
        const user = userEvent.setup()
        renderSelect("recent")

        await user.click(getTrigger())
        await user.keyboard("{ArrowUp}")
        expect(screen.getByRole("option", { name: "Mais recente" })).toHaveFocus()

        await user.keyboard("{ArrowDown}")
        expect(screen.getByRole("option", { name: "Mais antigo" })).toHaveFocus()

        await user.keyboard("{End}")
        expect(screen.getByRole("option", { name: "A–Z" })).toHaveFocus()

        await user.keyboard("{ArrowDown}")
        expect(screen.getByRole("option", { name: "A–Z" })).toHaveFocus()

        await user.keyboard("{Home}")
        expect(screen.getByRole("option", { name: "Mais recente" })).toHaveFocus()
    })

    it.each([["{Enter}"], [" "]])("escolhe a opção focada com %j", async (key) => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        renderSelect("recent", onChange)

        await user.click(getTrigger())
        await user.keyboard("{ArrowDown}")
        await user.keyboard(key)

        expect(onChange).toHaveBeenCalledTimes(1)
        expect(onChange).toHaveBeenCalledWith("oldest")
        expect(getTrigger()).toHaveAttribute("aria-expanded", "false")
        expect(getTrigger()).toHaveFocus()
    })

    it("Esc fecha sem chamar onChange e devolve o foco ao gatilho", async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        renderSelect("recent", onChange)

        await user.click(getTrigger())
        await user.keyboard("{ArrowDown}{Escape}")

        expect(onChange).not.toHaveBeenCalled()
        expect(getTrigger()).toHaveAttribute("aria-expanded", "false")
        expect(getTrigger()).toHaveFocus()
    })

    it("Tab fecha sem chamar onChange", async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        render(
            <>
                <SelectField label="Ordenar" options={options} value="recent" onChange={onChange} />
                <button type="button">Depois</button>
            </>
        )

        await user.click(getTrigger())
        await user.keyboard("{Tab}")

        expect(onChange).not.toHaveBeenCalled()
        expect(getTrigger()).toHaveAttribute("aria-expanded", "false")
    })

    it("clicar fora fecha sem chamar onChange", async () => {
        const user = userEvent.setup()
        const onChange = vi.fn()
        render(
            <>
                <SelectField label="Ordenar" options={options} value="recent" onChange={onChange} />
                <p>Fora</p>
            </>
        )

        await user.click(getTrigger())
        await user.click(screen.getByText("Fora"))

        expect(onChange).not.toHaveBeenCalled()
        expect(getTrigger()).toHaveAttribute("aria-expanded", "false")
    })

    it("mostra no gatilho a opção do value e acompanha a mudança dele", () => {
        const { rerender } = renderSelect("title")

        expect(getTrigger("Ordenar A–Z")).toHaveTextContent("A–Z")

        rerender(
            <SelectField label="Ordenar" options={options} value="oldest" onChange={vi.fn()} />
        )

        expect(getTrigger("Ordenar Mais antigo")).toHaveTextContent("Mais antigo")
    })

    it("não tem violações de acessibilidade fechado", async () => {
        const { container } = renderSelect()

        await expectNoAxeViolations(container)
    }, 15000)

    it("não tem violações de acessibilidade aberto", async () => {
        const user = userEvent.setup()
        const { container } = renderSelect()

        await user.click(getTrigger())

        await expectNoAxeViolations(container)
    }, 15000)
})
