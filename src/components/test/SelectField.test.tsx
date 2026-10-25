import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SelectField from "@/components/SelectField"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const options = [
    { value: "recent", label: "Mais recente" },
    { value: "oldest", label: "Mais antigo" },
    { value: "title", label: "A–Z" }
]

function renderSelect(value = "recent", onChange = vi.fn()) {
    return render(
        <SelectField label="Ordenar" options={options} value={value} onChange={onChange} />
    )
}

describe("SelectField", () => {
    it("envolve o select com um label visível e mostra as opções e o valor", () => {
        const { container } = renderSelect("oldest")
        const select = screen.getByRole("combobox", { name: "Ordenar" })

        expect(container.querySelector("label")).toContainElement(select)
        expect(container.querySelector("label")).toHaveTextContent("Ordenar")
        expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
            "Mais recente",
            "Mais antigo",
            "A–Z"
        ])
        expect(select).toHaveValue("oldest")
    })

    it("chama onChange com o valor escolhido", async () => {
        const onChange = vi.fn()
        renderSelect("recent", onChange)

        await userEvent.selectOptions(screen.getByRole("combobox", { name: "Ordenar" }), "title")

        expect(onChange).toHaveBeenCalledWith("title")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderSelect()

        await expectNoAxeViolations(container)
    }, 15000)
})
