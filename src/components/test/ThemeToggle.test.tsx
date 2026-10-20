import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ThemeToggle from "@/components/ThemeToggle"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

describe("ThemeToggle", () => {
    beforeEach(() => {
        localStorage.setItem(THEME_STORAGE_KEY, "light")
    })

    afterEach(() => {
        localStorage.removeItem(THEME_STORAGE_KEY)
        document.documentElement.removeAttribute("data-theme")
        window.history.replaceState(null, "", "/")
    })

    it("mantém o nome fixo e alterna aria-pressed, data-theme e a escolha salva", async () => {
        render(<ThemeToggle />)
        const button = screen.getByRole("button", { name: "Tema escuro" })

        expect(button).toHaveAttribute("aria-pressed", "false")

        await userEvent.click(button)

        expect(screen.getByRole("button", { name: "Tema escuro" })).toHaveAttribute(
            "aria-pressed",
            "true"
        )
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark")
        expect(document.documentElement).toHaveAttribute("data-theme", "dark")

        await userEvent.click(button)

        expect(button).toHaveAttribute("aria-pressed", "false")
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light")
    })

    it("não move o foco ao alternar", async () => {
        render(<ThemeToggle />)
        const button = screen.getByRole("button", { name: "Tema escuro" })

        await userEvent.click(button)

        expect(button).toHaveFocus()
    })

    it("troca o ícone entre lua e sol sem mudar o nome", async () => {
        const { container } = render(<ThemeToggle />)
        const before = container.querySelector("svg")?.innerHTML

        await userEvent.click(screen.getByRole("button", { name: "Tema escuro" }))

        expect(container.querySelector("svg")?.innerHTML).not.toBe(before)
    })

    it("mostra o texto visível na variante labeled", () => {
        render(<ThemeToggle variant="labeled" />)

        expect(screen.getByRole("button", { name: "Tema escuro" })).toHaveTextContent("Tema escuro")
    })

    it("ignora ?tema=dark na URL", () => {
        window.history.replaceState(null, "", "/?tema=dark")
        render(<ThemeToggle />)

        expect(screen.getByRole("button", { name: "Tema escuro" })).toHaveAttribute(
            "aria-pressed",
            "false"
        )
    })

    it("traduz o nome nos outros idiomas", async () => {
        await setLanguage("en")
        render(<ThemeToggle />)

        expect(screen.getByRole("button", { name: "Dark theme" })).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<ThemeToggle />)

        await expectNoAxeViolations(container)
    }, 15000)
})
