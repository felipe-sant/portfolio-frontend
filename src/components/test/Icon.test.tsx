import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import Icon from "@/components/Icon"
import ICON_NAMES from "@/enum/iconNames.enum"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("Icon", () => {
    it.each(ICON_NAMES)("renderiza o ícone %s decorativo e com traço de 2", (name) => {
        const { container } = render(<Icon name={name} />)
        const svg = container.querySelector("svg")

        expect(svg).toHaveAttribute("aria-hidden", "true")
        expect(svg).toHaveAttribute("focusable", "false")
        expect(svg).toHaveAttribute("viewBox", "0 0 24 24")
        expect(Number(svg?.getAttribute("stroke-width"))).toBeGreaterThanOrEqual(2)
        expect(Number(svg?.getAttribute("stroke-width"))).toBeLessThanOrEqual(2.4)
        expect(svg?.querySelector("path, circle, rect, polygon")).not.toBeNull()
    })

    it("renderiza o ícone filter com três traços e aria-hidden", () => {
        const { container } = render(<Icon name="filter" />)

        expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
        expect(container.querySelectorAll("path")).toHaveLength(3)
    })

    it("renderiza o ícone arrowLeft espelhando arrowRight com aria-hidden", () => {
        const { container } = render(<Icon name="arrowLeft" />)

        expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true")
        expect(container.querySelector("path[d='m12 19-7-7 7-7']")).not.toBeNull()
    })

    it("preenche só a estrela", () => {
        const { container: star } = render(<Icon name="star" />)
        const { container: check } = render(<Icon name="check" />)

        expect(star.querySelector("svg")).toHaveAttribute("fill", "currentColor")
        expect(check.querySelector("svg")).toHaveAttribute("fill", "none")
    })

    it("usa 16px por padrão e aceita outro tamanho", () => {
        const { container, rerender } = render(<Icon name="search" />)

        expect(container.querySelector("svg")).toHaveAttribute("width", "16")
        expect(container.querySelector("svg")).toHaveAttribute("height", "16")

        rerender(<Icon name="search" size={20} />)

        expect(container.querySelector("svg")).toHaveAttribute("width", "20")
        expect(container.querySelector("svg")).toHaveAttribute("height", "20")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(
            <>
                {ICON_NAMES.map((name) => (
                    <Icon key={name} name={name} />
                ))}
            </>
        )

        await expectNoAxeViolations(container)
    }, 15000)
})
