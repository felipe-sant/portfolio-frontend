import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import Chip from "@/components/Chip"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("Chip", () => {
    it("mostra o texto com a grafia recebida e não é um controle", () => {
        render(<Chip>TypeScript</Chip>)

        expect(screen.getByText("TypeScript")).toBeInTheDocument()
        expect(screen.queryByRole("button")).not.toBeInTheDocument()
    })

    it("aplica a variante do corpo só quando pedida", () => {
        render(
            <>
                <Chip font="body">Reviso o que entrego</Chip>
                <Chip>TypeScript</Chip>
            </>
        )

        expect(screen.getByText("Reviso o que entrego").className).toContain("body")
        expect(screen.getByText("TypeScript").className).not.toContain("body")
    })

    it("não tem violações de acessibilidade numa lista de chips", async () => {
        const { container } = render(
            <ul>
                <li>
                    <Chip>React</Chip>
                </li>
                <li>
                    <Chip>Node.js</Chip>
                </li>
            </ul>
        )

        await expectNoAxeViolations(container)
    })
})
