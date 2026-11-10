import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ResumeLink from "@/components/ResumeLink"
import ResumeModal from "@/components/ResumeModal"
import useResume from "@/hooks/useResume"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function ResumeHarness() {
    const resume = useResume()

    return (
        <>
            <ResumeLink href={resume.href} onOpen={resume.open}>
                Baixar CV
            </ResumeLink>
            <ResumeModal isOpen={resume.isOpen} onClose={resume.close} />
        </>
    )
}

describe("ResumeLink com o modal do currículo", () => {
    it("abre o modal com o PDF do idioma, sem mudar a rota", async () => {
        render(
            <MemoryRouter initialEntries={["/pt-BR/about"]}>
                <ResumeHarness />
            </MemoryRouter>
        )

        await userEvent.click(screen.getByRole("link", { name: "Baixar CV" }))

        const dialog = screen.getByRole("dialog", { name: "Currículo" })
        expect(within(dialog).getByTitle("Currículo em PDF")).toHaveAttribute(
            "src",
            "/cv/cv-pt-BR.pdf"
        )
    })

    it.each([
        ["Esc", () => userEvent.keyboard("{Escape}")],
        ["Fechar", () => userEvent.click(screen.getByRole("button", { name: "Fechar" }))]
    ])("%s fecha o modal e devolve o foco ao link de origem", async (_name, close) => {
        render(
            <MemoryRouter>
                <ResumeHarness />
            </MemoryRouter>
        )
        const link = screen.getByRole("link", { name: "Baixar CV" })

        await userEvent.click(link)
        await close()

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        expect(link).toHaveFocus()
    })
})

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
