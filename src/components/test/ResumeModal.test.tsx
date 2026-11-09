import { afterEach, describe, expect, it, vi } from "vitest"
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ResumeModal from "@/components/ResumeModal"
import setLanguage from "@/i18n/setLanguage"
import createFakePdf from "@/testUtils/createFakePdf"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import loadPdfRenderer from "@/utils/loadPdfRenderer"

vi.mock("@/utils/loadPdfRenderer", () => ({ default: vi.fn() }))

function stubPdfViewer(enabled: boolean) {
    Object.defineProperty(navigator, "pdfViewerEnabled", { value: enabled, configurable: true })
}

async function switchLanguage(language: SupportedLanguage) {
    await act(async () => {
        await setLanguage(language)
    })
}

function stubCoarsePointer(coarse: boolean) {
    vi.stubGlobal(
        "matchMedia",
        vi.fn((query: string) => ({
            matches: query === "(pointer: coarse)" && coarse,
            addEventListener: vi.fn(),
            removeEventListener: vi.fn()
        }))
    )
}

function getDownloadLink() {
    return screen.getByRole("link", { name: "Baixar PDF" })
}

function getTextLink() {
    return screen.getByRole("link", { name: "Ver versão em texto (Markdown)" })
}

afterEach(() => {
    Reflect.deleteProperty(navigator, "pdfViewerEnabled")
    vi.unstubAllGlobals()
    vi.mocked(loadPdfRenderer).mockReset()
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

    it("agrupa Baixar PDF e a versão em texto num mesmo contêiner do rodapé", () => {
        render(<ResumeModal isOpen onClose={vi.fn()} />)

        const download = screen.getByRole("link", { name: "Baixar PDF" })
        const text = screen.getByRole("link", { name: "Ver versão em texto (Markdown)" })
        const actions = download.parentElement as HTMLElement

        expect(text.parentElement).toBe(actions)
        expect(actions.querySelectorAll("a")).toHaveLength(2)
        expect(actions).not.toBe(screen.getByRole("dialog"))
    })

    it("no modo nativo mostra o iframe e não carrega o renderizador de PDF", () => {
        stubPdfViewer(true)
        stubCoarsePointer(false)

        render(<ResumeModal isOpen onClose={vi.fn()} />)

        expect(screen.getByTitle("Currículo em PDF").tagName).toBe("IFRAME")
        expect(loadPdfRenderer).not.toHaveBeenCalled()
    })

    it("sem visualizador de PDF desenha as páginas em canvas, sem iframe", async () => {
        stubPdfViewer(false)
        vi.mocked(loadPdfRenderer).mockResolvedValue(createFakePdf({ pages: 2 }).openDocument)

        render(<ResumeModal isOpen onClose={vi.fn()} />)

        expect(screen.queryByTitle("Currículo em PDF")).not.toBeInTheDocument()
        expect(
            await screen.findByRole("img", { name: "Página 1 de 2 do currículo" })
        ).toBeInTheDocument()
        expect(screen.getByRole("img", { name: "Página 2 de 2 do currículo" })).toBeInTheDocument()
    })

    it("com ponteiro grosso desenha as páginas em canvas mesmo com visualizador", async () => {
        stubPdfViewer(true)
        stubCoarsePointer(true)
        vi.mocked(loadPdfRenderer).mockResolvedValue(createFakePdf({ pages: 1 }).openDocument)

        render(<ResumeModal isOpen onClose={vi.fn()} />)

        expect(screen.queryByTitle("Currículo em PDF")).not.toBeInTheDocument()
        expect(
            await screen.findByRole("img", { name: "Página 1 de 1 do currículo" })
        ).toBeInTheDocument()
    })

    it("mantém os dois links fora da região em carregando, pronto e erro", async () => {
        stubPdfViewer(false)
        const fake = createFakePdf({ holdLoad: true })
        vi.mocked(loadPdfRenderer).mockResolvedValue(fake.openDocument)

        const { unmount } = render(<ResumeModal isOpen onClose={vi.fn()} />)
        expect(screen.getByRole("status")).toBeInTheDocument()
        expect(getDownloadLink()).toBeInTheDocument()
        expect(getTextLink()).toBeInTheDocument()

        await waitFor(() => expect(fake.openDocument).toHaveBeenCalled())
        await act(async () => {
            fake.release()
        })
        const region = await screen.findByRole("region", { name: "Páginas do currículo" })
        expect(region).not.toContainElement(getDownloadLink())
        expect(region).not.toContainElement(getTextLink())
        unmount()

        vi.mocked(loadPdfRenderer).mockRejectedValue(new Error("x"))
        render(<ResumeModal isOpen onClose={vi.fn()} />)
        expect(
            await screen.findByText(
                "Não foi possível exibir o currículo aqui. Baixe o PDF ou leia a versão em texto."
            )
        ).toBeInTheDocument()
        expect(screen.queryByRole("img")).not.toBeInTheDocument()
        expect(getDownloadLink()).toBeInTheDocument()
        expect(getTextLink()).toBeInTheDocument()
    })

    it("põe a região depois de Fechar e antes dos links na ordem de foco", async () => {
        stubPdfViewer(false)
        vi.mocked(loadPdfRenderer).mockResolvedValue(createFakePdf().openDocument)

        render(<ResumeModal isOpen onClose={vi.fn()} />)

        const region = await screen.findByRole("region", { name: "Páginas do currículo" })
        const close = screen.getByRole("button", { name: "Fechar" })
        const download = screen.getByRole("link", { name: "Baixar PDF" })

        expect(region).toHaveAttribute("tabindex", "0")
        expect(
            close.compareDocumentPosition(region) & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()
        expect(
            region.compareDocumentPosition(download) & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()
    })

    it("cancela o carregamento ao fechar durante a espera, sem erro nem aviso", async () => {
        stubPdfViewer(false)
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)
        const fake = createFakePdf({ holdLoad: true })
        vi.mocked(loadPdfRenderer).mockResolvedValue(fake.openDocument)

        const { rerender } = render(<ResumeModal isOpen onClose={vi.fn()} />)
        await waitFor(() => expect(fake.openDocument).toHaveBeenCalled())
        rerender(<ResumeModal isOpen={false} onClose={vi.fn()} />)
        await act(async () => {
            await Promise.resolve()
        })

        expect(fake.destroy).toHaveBeenCalledTimes(1)
        expect(consoleError).not.toHaveBeenCalled()
        consoleError.mockRestore()
    })

    it("não tem violações de acessibilidade no modo canvas pronto", async () => {
        stubPdfViewer(false)
        vi.mocked(loadPdfRenderer).mockResolvedValue(createFakePdf().openDocument)

        render(<ResumeModal isOpen onClose={vi.fn()} />)
        await screen.findByRole("region", { name: "Páginas do currículo" })

        await expectNoAxeViolations(document.body)
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
    })
})
