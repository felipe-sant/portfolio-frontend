import { afterEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ResumeModal from "@/components/ResumeModal"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function stubPdfViewer(enabled: boolean) {
    Object.defineProperty(navigator, "pdfViewerEnabled", { value: enabled, configurable: true })
}

async function switchLanguage(language: SupportedLanguage) {
    await act(async () => {
        await setLanguage(language)
    })
}

afterEach(() => {
    Reflect.deleteProperty(navigator, "pdfViewerEnabled")
})

describe("ResumeModal", () => {
    it("fechado não renderiza nada", () => {
        render(<ResumeModal isOpen={false} onClose={vi.fn()} />)

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("abre como diálogo modal com o título Currículo focado e Fechar antes do documento", () => {
        render(<ResumeModal isOpen onClose={vi.fn()} />)

        const dialog = screen.getByRole("dialog", { name: "Currículo" })
        const heading = screen.getByRole("heading", { level: 2, name: "Currículo" })
        const close = screen.getByRole("button", { name: "Fechar" })
        const frame = screen.getByTitle("Currículo em PDF")

        expect(dialog).toHaveAttribute("aria-modal", "true")
        expect(heading).toHaveFocus()
        expect(close.compareDocumentPosition(frame) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it("mostra o PDF do idioma num iframe titulado quando o navegador exibe PDF", async () => {
        stubPdfViewer(true)
        await switchLanguage("en")
        render(<ResumeModal isOpen onClose={vi.fn()} />)

        const frame = screen.getByTitle("Resume in PDF")

        expect(frame.tagName).toBe("IFRAME")
        expect(frame).toHaveAttribute("src", "/cv/cv-en.pdf")
    })

    it("mantém Baixar PDF e a versão em texto fora do iframe", async () => {
        await switchLanguage("es")
        render(<ResumeModal isOpen onClose={vi.fn()} />)

        const download = screen.getByRole("link", { name: "Descargar PDF" })
        const text = screen.getByRole("link", { name: "Ver versión en texto (Markdown)" })

        expect(download).toHaveAttribute("href", "/cv/cv-es.pdf")
        expect(download).toHaveAttribute("download")
        expect(text).toHaveAttribute("href", "/cv/cv-es.md")
        expect(text).toHaveAttribute("target", "_blank")
        expect(text).toHaveAttribute("rel", "noopener noreferrer")
        expect(screen.getByTitle("Currículum en PDF")).not.toContainElement(download)
    })

    it("sem visualizador de PDF não renderiza o iframe e mantém os dois links", () => {
        stubPdfViewer(false)
        render(<ResumeModal isOpen onClose={vi.fn()} />)

        expect(screen.queryByTitle("Currículo em PDF")).not.toBeInTheDocument()
        expect(
            screen.getByText(
                "Seu navegador não mostra PDF aqui. Baixe o arquivo ou leia a versão em texto."
            )
        ).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Baixar PDF" })).toBeInTheDocument()
        expect(
            screen.getByRole("link", { name: "Ver versão em texto (Markdown)" })
        ).toBeInTheDocument()
    })

    it("chama onClose pelo botão Fechar, pelo Esc e pelo clique no fundo", async () => {
        const onClose = vi.fn()
        render(<ResumeModal isOpen onClose={onClose} />)

        await userEvent.click(screen.getByRole("button", { name: "Fechar" }))
        expect(onClose).toHaveBeenCalledTimes(1)

        fireEvent.keyDown(document, { key: "Escape" })
        expect(onClose).toHaveBeenCalledTimes(2)

        const backdrop = screen.getByRole("dialog").parentElement as HTMLElement
        fireEvent.mouseDown(backdrop)
        fireEvent.click(backdrop)
        expect(onClose).toHaveBeenCalledTimes(3)
    })

    it.each([
        ["en", "Resume", "Close", "Download PDF"],
        ["es", "Currículum", "Cerrar", "Descargar PDF"]
    ] as const)("traduz o modal em %s", async (language, title, close, download) => {
        await switchLanguage(language)
        render(<ResumeModal isOpen onClose={vi.fn()} />)

        expect(screen.getByRole("heading", { level: 2, name: title })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: close })).toBeInTheDocument()
        expect(screen.getByRole("link", { name: download })).toBeInTheDocument()
        expect(screen.queryByText(/resume\.modal/)).not.toBeInTheDocument()
    })

    it("não tem violações de acessibilidade com o modal aberto", async () => {
        const { container } = render(<ResumeModal isOpen onClose={vi.fn()} />)

        await expectNoAxeViolations(document.body)
        await expectNoAxeViolations(container)
    }, 15000)
})
