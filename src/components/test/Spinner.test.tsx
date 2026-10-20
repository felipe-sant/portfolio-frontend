import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import Spinner from "@/components/Spinner"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("Spinner", () => {
    it("é decorativo sem rótulo", async () => {
        const { container } = render(<Spinner />)

        expect(screen.queryByRole("status")).not.toBeInTheDocument()
        expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
        expect(container.querySelector("svg")).toHaveAttribute("width", "14")

        await expectNoAxeViolations(container)
    }, 15000)

    it("anuncia o rótulo como status", async () => {
        const { container } = render(<Spinner label="Carregando..." size={20} />)

        expect(screen.getByRole("status")).toHaveTextContent("Carregando...")
        expect(container.querySelector("svg")).toHaveAttribute("width", "20")

        await expectNoAxeViolations(container)
    }, 15000)
})
