import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import SkipLink from "@/components/SkipLink"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("SkipLink", () => {
    it("aponta para o alvo", () => {
        render(<SkipLink targetId="main-content" />)

        expect(screen.getByRole("link", { name: "Pular para o conteúdo" })).toHaveAttribute(
            "href",
            "#main-content"
        )
    })

    it("é o primeiro foco do documento", async () => {
        render(
            <>
                <SkipLink targetId="main-content" />
                <button type="button">Outro</button>
            </>
        )

        await userEvent.tab()

        expect(screen.getByRole("link", { name: "Pular para o conteúdo" })).toHaveFocus()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(
            <>
                <SkipLink targetId="main-content" />
                <main id="main-content">
                    <h1>Título</h1>
                </main>
            </>
        )

        await expectNoAxeViolations(container)
    }, 15000)
})
