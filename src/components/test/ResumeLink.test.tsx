import { describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ResumeLink from "@/components/ResumeLink"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("ResumeLink", () => {
    it("é um link real para o PDF, sem download nem target", () => {
        render(
            <ResumeLink href="/cv/cv-pt-BR.pdf" onOpen={vi.fn()}>
                Baixar CV
            </ResumeLink>
        )
        const link = screen.getByRole("link", { name: "Baixar CV" })

        expect(link).toHaveAttribute("href", "/cv/cv-pt-BR.pdf")
        expect(link).not.toHaveAttribute("download")
        expect(link).not.toHaveAttribute("target")
    })

    it("o clique simples impede a navegação e entrega o link a onOpen", async () => {
        const onOpen = vi.fn()
        render(
            <ResumeLink href="/cv/cv-pt-BR.pdf" onOpen={onOpen}>
                Baixar CV
            </ResumeLink>
        )
        const link = screen.getByRole("link", { name: "Baixar CV" })

        const notPrevented = fireEvent.click(link)

        expect(notPrevented).toBe(false)
        expect(onOpen).toHaveBeenCalledWith(link)
    })

    it("clique com Ctrl deixa o navegador abrir o PDF", async () => {
        const onOpen = vi.fn()
        render(
            <ResumeLink href="/cv/cv-pt-BR.pdf" onOpen={onOpen}>
                Baixar CV
            </ResumeLink>
        )

        const notPrevented = fireEvent.click(screen.getByRole("link"), { ctrlKey: true })

        expect(notPrevented).toBe(true)
        expect(onOpen).not.toHaveBeenCalled()
    })

    it("com variant usa a aparência de botão", () => {
        render(
            <ResumeLink href="/cv/cv-pt-BR.pdf" onOpen={vi.fn()} variant="secondary" size="lg">
                Baixar CV
            </ResumeLink>
        )

        expect(screen.getByRole("link").className).toContain("secondary")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(
            <ResumeLink href="/cv/cv-pt-BR.pdf" onOpen={vi.fn()}>
                Baixar CV
            </ResumeLink>
        )

        await userEvent.tab()

        await expectNoAxeViolations(container)
    })
})
