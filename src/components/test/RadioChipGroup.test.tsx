import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import RadioChipGroup from "@/components/RadioChipGroup"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const OPTIONS = [
    { value: "a", label: "Opção A" },
    { value: "b", label: "Opção B" },
    { value: "c", label: "Opção C" }
]

function Controlled({ onChange }: { onChange?: (value: string) => void }) {
    const [value, setValue] = useState("a")

    return (
        <RadioChipGroup
            legend="Assunto"
            options={OPTIONS}
            value={value}
            name="subject"
            onChange={(next) => {
                setValue(next)
                onChange?.(next)
            }}
        />
    )
}

describe("RadioChipGroup", () => {
    it("renderiza fieldset com legend e um rádio por opção com o mesmo name", () => {
        render(<Controlled />)
        const group = screen.getByRole("group", { name: "Assunto" })
        const radios = screen.getAllByRole("radio")

        expect(group.tagName).toBe("FIELDSET")
        expect(radios).toHaveLength(3)
        radios.forEach((radio) => expect(radio).toHaveAttribute("name", "subject"))
        expect(screen.getByRole("radio", { name: "Opção A" })).toBeChecked()
    })

    it("sem name usa o mesmo identificador gerado para todos os rádios", () => {
        render(<RadioChipGroup legend="Ordenar" options={OPTIONS} value="a" onChange={vi.fn()} />)
        const names = screen.getAllByRole("radio").map((radio) => radio.getAttribute("name"))

        expect(names[0]).toBeTruthy()
        expect(new Set(names).size).toBe(1)
    })

    it("as setas trocam a opção marcada e chamam onChange com o valor", async () => {
        const onChange = vi.fn()
        render(<Controlled onChange={onChange} />)

        await userEvent.tab()
        await userEvent.keyboard("{ArrowDown}")

        expect(screen.getByRole("radio", { name: "Opção B" })).toBeChecked()
        expect(onChange).toHaveBeenLastCalledWith("b")
    })

    it("disabled desabilita todos os rádios", () => {
        render(
            <RadioChipGroup
                legend="Assunto"
                options={OPTIONS}
                value="a"
                disabled
                onChange={vi.fn()}
            />
        )

        screen.getAllByRole("radio").forEach((radio) => expect(radio).toBeDisabled())
    })

    it("não usa aria-pressed", () => {
        render(<Controlled />)

        screen
            .getAllByRole("radio")
            .forEach((radio) => expect(radio).not.toHaveAttribute("aria-pressed"))
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<Controlled />)

        await expectNoAxeViolations(container)
    })
})
