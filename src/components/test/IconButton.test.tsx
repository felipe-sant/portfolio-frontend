import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import IconButton from "@/components/IconButton"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("IconButton", () => {
    it("usa label como nome acessível e type button", () => {
        render(<IconButton icon="menu" label="Menu" />)
        const button = screen.getByRole("button", { name: "Menu" })

        expect(button).toHaveAttribute("type", "button")
        expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
    })

    it("chama onClick ao clicar", async () => {
        const onClick = vi.fn()
        render(<IconButton icon="menu" label="Menu" onClick={onClick} />)

        await userEvent.click(screen.getByRole("button", { name: "Menu" }))

        expect(onClick).toHaveBeenCalledTimes(1)
    })

    it("repassa aria-pressed, aria-expanded e aria-controls", () => {
        render(
            <IconButton
                icon="moon"
                label="Tema escuro"
                aria-pressed={true}
                aria-expanded={false}
                aria-controls="panel"
            />
        )
        const button = screen.getByRole("button", { name: "Tema escuro" })

        expect(button).toHaveAttribute("aria-pressed", "true")
        expect(button).toHaveAttribute("aria-expanded", "false")
        expect(button).toHaveAttribute("aria-controls", "panel")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<IconButton icon="menu" label="Menu" />)

        await expectNoAxeViolations(container)
    }, 15000)
})
