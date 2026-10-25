import { describe, it, expect } from "vitest"
import { render } from "@testing-library/react"
import ProjectCardSkeleton from "@/components/ProjectCardSkeleton"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("ProjectCardSkeleton", () => {
    it("fica inteiro em aria-hidden, sem texto nem link", () => {
        const { container } = render(<ProjectCardSkeleton />)

        expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true")
        expect(container.textContent).toBe("")
        expect(container.querySelector("a")).not.toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<ProjectCardSkeleton />)

        await expectNoAxeViolations(container)
    }, 15000)
})
