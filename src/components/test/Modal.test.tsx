import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import Modal from "@/components/Modal"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

let appRoot: HTMLDivElement

type ModalTestProps = {
    isOpen?: boolean
    onClose?: () => void
    withDescription?: boolean
}

function ModalPage({ isOpen = true, onClose = vi.fn(), withDescription = false }: ModalTestProps) {
    return (
        <>
            <button type="button">Abrir</button>
            <Modal
                isOpen={isOpen}
                title="Filtros"
                closeLabel="Fechar"
                onClose={onClose}
                description={withDescription ? "resumo" : undefined}
                footer={<button type="button">Aplicar</button>}
            >
                <p id="resumo">Resumo</p>
                <button type="button">Conteúdo</button>
            </Modal>
        </>
    )
}

function renderModal(props: ModalTestProps = {}) {
    return render(<ModalPage {...props} />, { container: appRoot })
}

beforeEach(() => {
    appRoot = document.createElement("div")
    appRoot.id = "root"
    document.body.appendChild(appRoot)
})

afterEach(() => {
    appRoot.remove()
})

describe("Modal", () => {
    it("fechado, não renderiza o diálogo nem altera o #root e o body", () => {
        renderModal({ isOpen: false })

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        expect(appRoot).not.toHaveAttribute("inert")
        expect(document.body).not.toHaveAttribute("data-scroll-locked")
    })

    it("aberto, é um diálogo modal nomeado pelo título, com o Fechar antes do conteúdo", () => {
        renderModal({ withDescription: true })

        const dialog = screen.getByRole("dialog", { name: "Filtros" })
        const closeButton = screen.getByRole("button", { name: "Fechar" })
        const content = screen.getByRole("button", { name: "Conteúdo" })

        expect(dialog).toHaveAttribute("aria-modal", "true")
        expect(dialog).toHaveAccessibleDescription("Resumo")
        expect(screen.getByRole("heading", { level: 2, name: "Filtros" })).toBeVisible()
        expect(
            closeButton.compareDocumentPosition(content) & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy()
        expect(dialog.parentElement?.parentElement).toBe(document.body)
    })

    it("não tem aria-describedby sem description", () => {
        renderModal()

        expect(screen.getByRole("dialog")).not.toHaveAttribute("aria-describedby")
    })

    it("leva o foco ao título e devolve ao elemento de origem ao fechar", () => {
        const { rerender } = renderModal({ isOpen: false })
        const origin = screen.getByRole("button", { name: "Abrir" })
        origin.focus()

        rerender(<ModalPage isOpen />)
        expect(screen.getByRole("heading", { name: "Filtros" })).toHaveFocus()

        rerender(<ModalPage isOpen={false} />)
        expect(origin).toHaveFocus()
    })

    it("o botão Fechar chama onClose", async () => {
        const onClose = vi.fn()
        renderModal({ onClose })

        await userEvent.click(screen.getByRole("button", { name: "Fechar" }))

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("Esc chama onClose", async () => {
        const onClose = vi.fn()
        renderModal({ onClose })

        await userEvent.keyboard("{Escape}")

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("clicar no fundo chama onClose e clicar dentro da caixa não", async () => {
        const onClose = vi.fn()
        renderModal({ onClose })
        const dialog = screen.getByRole("dialog")
        const backdrop = dialog.parentElement as HTMLElement

        await userEvent.click(dialog)
        expect(onClose).not.toHaveBeenCalled()

        await userEvent.click(backdrop)
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("começar o clique dentro da caixa e soltar no fundo não chama onClose", () => {
        const onClose = vi.fn()
        renderModal({ onClose })
        const dialog = screen.getByRole("dialog")
        const backdrop = dialog.parentElement as HTMLElement

        fireEvent.mouseDown(dialog)
        fireEvent.mouseUp(backdrop)
        fireEvent.click(backdrop)

        expect(onClose).not.toHaveBeenCalled()
    })

    it("marca o #root como inert e trava o body enquanto aberto, e desfaz ao desmontar", () => {
        const { unmount } = renderModal()

        expect(appRoot).toHaveAttribute("inert")
        expect(document.body).toHaveAttribute("data-scroll-locked")

        unmount()

        expect(appRoot).not.toHaveAttribute("inert")
        expect(document.body).not.toHaveAttribute("data-scroll-locked")
    })

    it("abrir, fechar e abrir de novo não deixa inert nem trava presos", () => {
        const { rerender } = renderModal()

        rerender(<ModalPage isOpen={false} />)
        rerender(<ModalPage isOpen />)
        rerender(<ModalPage isOpen={false} />)

        expect(appRoot).not.toHaveAttribute("inert")
        expect(document.body).not.toHaveAttribute("data-scroll-locked")
    })

    it("não tem violações de acessibilidade aberto", async () => {
        renderModal({ withDescription: true })

        await expectNoAxeViolations(document.body)
    }, 15000)
})
