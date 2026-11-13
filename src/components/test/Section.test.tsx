import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import Section from "@/components/Section"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("Section", () => {
    it("rende a seção rotulada pelo título", () => {
        render(
            <Section headingId="titulo" heading="Stack">
                <p>Conteúdo</p>
            </Section>
        )

        const heading = screen.getByRole("heading", { level: 2, name: "Stack" })

        expect(heading).toHaveAttribute("id", "titulo")
        expect(screen.getByRole("region", { name: "Stack" })).toHaveAttribute(
            "aria-labelledby",
            "titulo"
        )
        expect(screen.getByText("Conteúdo")).toBeInTheDocument()
    })

    it("não envolve em Reveal por padrão", () => {
        const { container } = render(
            <Section headingId="titulo" heading="Stack">
                <p>Conteúdo</p>
            </Section>
        )

        expect(container.firstElementChild?.tagName).toBe("SECTION")
    })

    it("envolve em Reveal com reveal", () => {
        const { container } = render(
            <Section headingId="titulo" heading="Stack" reveal>
                <p>Conteúdo</p>
            </Section>
        )

        expect(container.firstElementChild?.tagName).toBe("DIV")
        expect(container.querySelector("div > section")).not.toBeNull()
    })

    it("só aceita foco programático no título com headingFocusable", () => {
        const { rerender } = render(
            <Section headingId="titulo" heading="Stack">
                <p>Conteúdo</p>
            </Section>
        )

        expect(screen.getByRole("heading", { name: "Stack" })).not.toHaveAttribute("tabindex")

        rerender(
            <Section headingId="titulo" heading="Stack" headingFocusable>
                <p>Conteúdo</p>
            </Section>
        )

        expect(screen.getByRole("heading", { name: "Stack" })).toHaveAttribute("tabindex", "-1")
    })

    it("mostra a dica abaixo do título só quando informada", () => {
        const { rerender } = render(
            <Section headingId="titulo" heading="Trajetória">
                <p>Conteúdo</p>
            </Section>
        )

        expect(screen.queryByText("Clique para ver o detalhe")).not.toBeInTheDocument()

        rerender(
            <Section headingId="titulo" heading="Trajetória" hint="Clique para ver o detalhe">
                <p>Conteúdo</p>
            </Section>
        )

        const heading = screen.getByRole("heading", { name: "Trajetória" })
        const hint = screen.getByText("Clique para ver o detalhe")

        expect(heading.compareDocumentPosition(hint)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(
            <Section headingId="titulo" heading="Stack" reveal hint="Dica" headingFocusable>
                <p>Conteúdo</p>
            </Section>
        )

        await expectNoAxeViolations(container)
    })
})
