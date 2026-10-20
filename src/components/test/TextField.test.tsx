import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TextField from "@/components/TextField"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("TextField", () => {
    it("liga o rótulo ao campo e chama onChange ao digitar", async () => {
        const onChange = vi.fn()
        render(<TextField label="Nome" onChange={onChange} />)

        await userEvent.type(screen.getByLabelText("Nome"), "Ana")

        expect(onChange).toHaveBeenCalledTimes(3)
        expect(screen.getByLabelText("Nome")).toHaveValue("Ana")
    })

    it("repassa type, autocomplete e inputmode ao input", () => {
        render(<TextField label="E-mail" type="email" autoComplete="email" inputMode="email" />)
        const input = screen.getByLabelText("E-mail")

        expect(input).toHaveAttribute("type", "email")
        expect(input).toHaveAttribute("autocomplete", "email")
        expect(input).toHaveAttribute("inputmode", "email")
    })

    it("renderiza textarea com as linhas pedidas em multiline", () => {
        render(<TextField label="Mensagem" multiline rows={6} />)
        const field = screen.getByLabelText("Mensagem")

        expect(field.tagName).toBe("TEXTAREA")
        expect(field).toHaveAttribute("rows", "6")
    })

    it("usa 4 linhas por padrão em multiline", () => {
        render(<TextField label="Mensagem" multiline />)

        expect(screen.getByLabelText("Mensagem")).toHaveAttribute("rows", "4")
    })

    it("sem erro não marca aria-invalid", () => {
        render(<TextField label="Nome" />)

        expect(screen.getByLabelText("Nome")).not.toHaveAttribute("aria-invalid")
    })

    it("liga a dica por aria-describedby", () => {
        render(<TextField label="Nome" hint="Como devo te chamar" />)

        expect(screen.getByLabelText("Nome")).toHaveAccessibleDescription("Como devo te chamar")
    })

    it("marca o erro, liga a mensagem e esconde a dica", () => {
        render(<TextField label="Nome" hint="Como devo te chamar" error="Informe o nome" />)
        const input = screen.getByLabelText("Nome")

        expect(input).toHaveAttribute("aria-invalid", "true")
        expect(input).toHaveAccessibleDescription("Informe o nome")
        expect(screen.queryByText("Como devo te chamar")).not.toBeInTheDocument()
    })

    it("concatena o describedBy extra ao da mensagem", () => {
        render(
            <>
                <TextField label="Mensagem" error="Informe a mensagem" describedBy="counter" />
                <p id="counter">0 de 500</p>
            </>
        )

        expect(screen.getByLabelText("Mensagem")).toHaveAccessibleDescription(
            "Informe a mensagem 0 de 500"
        )
    })

    it("required vira aria-required sem o atributo nativo", () => {
        render(<TextField label="Nome" required />)
        const input = screen.getByLabelText("Nome")

        expect(input).toHaveAttribute("aria-required", "true")
        expect(input).not.toHaveAttribute("required")
    })

    it("não tem violações de acessibilidade normal, com erro e multiline", async () => {
        const { container } = render(
            <>
                <TextField label="Nome" hint="Dica" />
                <TextField label="E-mail" error="Informe o e-mail" required />
                <TextField label="Mensagem" multiline />
            </>
        )

        await expectNoAxeViolations(container)
    }, 15000)
})
