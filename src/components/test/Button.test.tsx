import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Button from "@/components/Button"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("Button", () => {
    it("chama onClick ao clicar e usa type button por padrão", async () => {
        const onClick = vi.fn()
        render(<Button onClick={onClick}>Ver projetos</Button>)
        const button = screen.getByRole("button", { name: "Ver projetos" })

        await userEvent.click(button)

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(button).toHaveAttribute("type", "button")
    })

    it("aceita type submit", () => {
        render(<Button type="submit">Enviar mensagem</Button>)

        expect(screen.getByRole("button")).toHaveAttribute("type", "submit")
    })

    it.each(["primary", "secondary", "ghost"] as const)("renderiza a variante %s", (variant) => {
        render(<Button variant={variant}>Ação</Button>)

        expect(screen.getByRole("button", { name: "Ação" })).toBeInTheDocument()
    })

    it.each(["sm", "md", "lg"] as const)("renderiza o tamanho %s", (size) => {
        render(
            <Button size={size} fullWidth>
                Ação
            </Button>
        )

        expect(screen.getByRole("button", { name: "Ação" })).toBeInTheDocument()
    })

    it("mostra o ícone no início e no fim", () => {
        const { container, rerender } = render(<Button icon="download">Baixar CV</Button>)

        expect(screen.getByRole("button").firstElementChild).toBe(container.querySelector("svg"))

        rerender(
            <Button icon="download" iconPosition="end">
                Baixar CV
            </Button>
        )

        expect(screen.getByRole("button").lastElementChild).toBe(container.querySelector("svg"))
    })

    it("carregando ignora o clique, mantém o foco e não usa disabled", async () => {
        const onClick = vi.fn()
        render(
            <Button loading icon="download" onClick={onClick}>
                Enviar mensagem
            </Button>
        )
        const button = screen.getByRole("button", { name: "Enviar mensagem" })

        await userEvent.tab()
        await userEvent.click(button)

        expect(onClick).not.toHaveBeenCalled()
        expect(button).toHaveAttribute("aria-busy", "true")
        expect(button).toHaveAttribute("aria-disabled", "true")
        expect(button).not.toBeDisabled()
        expect(button).toHaveFocus()
        expect(button.querySelectorAll("svg")).toHaveLength(1)
    })

    it("sem carregar não marca aria-busy nem aria-disabled", () => {
        render(<Button>Ação</Button>)

        expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy")
        expect(screen.getByRole("button")).not.toHaveAttribute("aria-disabled")
    })

    it("desabilitado usa disabled nativo e não chama onClick", async () => {
        const onClick = vi.fn()
        render(
            <Button disabled onClick={onClick}>
                Ação
            </Button>
        )

        await userEvent.click(screen.getByRole("button"))

        expect(screen.getByRole("button")).toBeDisabled()
        expect(onClick).not.toHaveBeenCalled()
    })

    it("não tem violações de acessibilidade no estado normal e carregando", async () => {
        const { container, rerender } = render(<Button icon="download">Baixar CV</Button>)

        await expectNoAxeViolations(container)

        rerender(<Button loading>Enviar mensagem</Button>)

        await expectNoAxeViolations(container)
    }, 15000)
})
