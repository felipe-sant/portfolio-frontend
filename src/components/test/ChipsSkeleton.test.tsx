import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import ChipsSkeleton from "@/components/ChipsSkeleton"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("ChipsSkeleton", () => {
    it("mostra três esqueletos ocultos da tecnologia assistiva", () => {
        const { container } = render(<ChipsSkeleton />)

        expect(container.querySelectorAll('[aria-hidden="true"]')).toHaveLength(3)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<ChipsSkeleton />)

        await expectNoAxeViolations(container)
    })
})
