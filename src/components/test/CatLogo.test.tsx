import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import CatLogo from "@/components/CatLogo"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("CatLogo", () => {
    it("fica escondido da árvore de acessibilidade", () => {
        const { container } = render(<CatLogo />)
        const svg = container.querySelector("svg")

        expect(svg).toHaveAttribute("aria-hidden", "true")
        expect(svg).toHaveAttribute("focusable", "false")
    })

    it("aceita altura", () => {
        const { container } = render(<CatLogo height={32} />)

        expect(container.querySelector("svg")).toHaveAttribute("height", "32")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<CatLogo />)

        await expectNoAxeViolations(container)
    }, 15000)
})
