import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import ExternalButtonLink from "@/components/ExternalButtonLink"
import buttonCss from "@/styles/components/button.module.css"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function renderLink(variant?: "primary" | "secondary") {
    return render(
        <ExternalButtonLink
            href={"https://github.com/felipe-sant/maps"}
            aria-label={"Ver código no GitHub: Maps (abre em nova aba)"}
            variant={variant}
        >
            {"Ver código no GitHub"}
        </ExternalButtonLink>
    )
}

describe("ExternalButtonLink", () => {
    it("renderiza um a externo com href, target e rel", () => {
        renderLink()
        const link = screen.getByRole("link")

        expect(link).toHaveAttribute("href", "https://github.com/felipe-sant/maps")
        expect(link).toHaveAttribute("target", "_blank")
        expect(link).toHaveAttribute("rel", "noopener noreferrer")
    })

    it("usa o aria-label como nome acessível e esconde a seta", () => {
        const { container } = renderLink()
        const link = screen.getByRole("link", {
            name: "Ver código no GitHub: Maps (abre em nova aba)"
        })

        expect(link).toHaveTextContent("Ver código no GitHub")
        expect(container.querySelector('span[aria-hidden="true"]')).toHaveTextContent("↗")
    })

    it("aplica as classes da variante primária e da secundária do Button", () => {
        const primary = renderLink("primary")
        expect(screen.getByRole("link")).toHaveClass(buttonCss.button, buttonCss.primary)
        primary.unmount()

        renderLink("secondary")
        expect(screen.getByRole("link")).toHaveClass(buttonCss.button, buttonCss.secondary)
        expect(screen.getByRole("link")).not.toHaveClass(buttonCss.primary)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderLink()

        await expectNoAxeViolations(container)
    }, 15000)
})
