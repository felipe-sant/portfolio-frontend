import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import MotionToggle from "@/components/MotionToggle"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

describe("MotionToggle", () => {
    beforeEach(() => {
        localStorage.setItem(MOTION_STORAGE_KEY, "full")
    })

    afterEach(() => {
        localStorage.removeItem(MOTION_STORAGE_KEY)
        document.documentElement.removeAttribute("data-motion")
    })

    it("mantém o nome fixo e alterna aria-pressed, data-motion e a escolha salva", async () => {
        render(<MotionToggle />)
        const button = screen.getByRole("button", { name: "Reduzir movimento" })

        expect(button).toHaveAttribute("aria-pressed", "false")

        await userEvent.click(button)

        expect(button).toHaveAttribute("aria-pressed", "true")
        expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("reduced")
        expect(document.documentElement).toHaveAttribute("data-motion", "reduced")

        await userEvent.click(button)

        expect(button).toHaveAttribute("aria-pressed", "false")
        expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("full")
    })

    it("não move o foco ao alternar", async () => {
        render(<MotionToggle />)
        const button = screen.getByRole("button", { name: "Reduzir movimento" })

        await userEvent.click(button)

        expect(button).toHaveFocus()
    })

    it("começa pressionado quando a escolha salva é movimento reduzido", () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        render(<MotionToggle />)

        expect(screen.getByRole("button", { name: "Reduzir movimento" })).toHaveAttribute(
            "aria-pressed",
            "true"
        )
    })

    it("mostra o texto visível na variante labeled", () => {
        render(<MotionToggle variant="labeled" />)

        expect(screen.getByRole("button", { name: "Reduzir movimento" })).toHaveTextContent(
            "Reduzir movimento"
        )
    })

    it("traduz o nome nos outros idiomas", async () => {
        await setLanguage("en")
        render(<MotionToggle />)

        expect(screen.getByRole("button", { name: "Reduce motion" })).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<MotionToggle />)

        await expectNoAxeViolations(container)
    }, 15000)
})
