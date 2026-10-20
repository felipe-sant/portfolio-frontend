import { useState } from "react"
import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SearchInput from "@/components/SearchInput"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function ControlledSearch({ onClear }: { onClear?: () => void }) {
    const [value, setValue] = useState("")

    return (
        <SearchInput
            value={value}
            label="Buscar projetos"
            placeholder="Procure um projeto"
            onChange={setValue}
            onClear={() => {
                setValue("")
                onClear?.()
            }}
        />
    )
}

describe("SearchInput", () => {
    it("encontra o campo pelo rótulo e não mostra o botão de limpar quando vazio", () => {
        render(
            <SearchInput value="" label="Buscar projetos" onChange={vi.fn()} onClear={vi.fn()} />
        )

        expect(screen.getByRole("searchbox", { name: "Buscar projetos" })).toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("mostra o botão Limpar busca com texto e traduz ao trocar o idioma", async () => {
        render(
            <SearchInput
                value="react"
                label="Buscar projetos"
                onChange={vi.fn()}
                onClear={vi.fn()}
            />
        )

        expect(screen.getByRole("button", { name: "Limpar busca" })).toBeInTheDocument()

        await setLanguage("en")

        expect(await screen.findByRole("button", { name: "Clear search" })).toBeInTheDocument()
    })

    it("chama onChange com o valor digitado", async () => {
        const onChange = vi.fn()
        render(
            <SearchInput value="" label="Buscar projetos" onChange={onChange} onClear={vi.fn()} />
        )

        await userEvent.type(screen.getByRole("searchbox"), "a")

        expect(onChange).toHaveBeenCalledWith("a")
    })

    it("limpa, chama onClear e devolve o foco ao campo", async () => {
        const onClear = vi.fn()
        render(<ControlledSearch onClear={onClear} />)
        const input = screen.getByRole("searchbox", { name: "Buscar projetos" })

        await userEvent.type(input, "react")
        await userEvent.click(screen.getByRole("button", { name: "Limpar busca" }))

        expect(onClear).toHaveBeenCalledTimes(1)
        expect(input).toHaveValue("")
        expect(input).toHaveFocus()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("não tem violações de acessibilidade vazio e preenchido", async () => {
        const { container, rerender } = render(
            <SearchInput value="" label="Buscar projetos" onChange={vi.fn()} onClear={vi.fn()} />
        )

        await expectNoAxeViolations(container)

        rerender(
            <SearchInput
                value="react"
                label="Buscar projetos"
                onChange={vi.fn()}
                onClear={vi.fn()}
            />
        )

        await expectNoAxeViolations(container)
    }, 15000)
})
