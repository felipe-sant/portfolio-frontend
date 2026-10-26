import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useRef } from "react"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import useModalBehavior from "@/hooks/useModalBehavior"

type HarnessProps = {
    isOpen: boolean
    onClose?: () => void
    withFocusables?: boolean
}

function Harness({ isOpen, onClose = vi.fn(), withFocusables = true }: HarnessProps) {
    const boxRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)

    useModalBehavior({ isOpen, onClose, boxRef, titleRef })

    return (
        <div ref={boxRef}>
            <h2 ref={titleRef} tabIndex={-1}>
                Título
            </h2>
            {withFocusables && (
                <>
                    <button type="button">Primeiro</button>
                    <button type="button">Último</button>
                </>
            )}
        </div>
    )
}

function Page({ isOpen, onClose, withFocusables }: HarnessProps) {
    return (
        <>
            <button type="button">Origem</button>
            <Harness isOpen={isOpen} onClose={onClose} withFocusables={withFocusables} />
        </>
    )
}

let appRoot: HTMLDivElement

function renderPage(props: HarnessProps) {
    return render(<Page {...props} />, { container: appRoot })
}

beforeEach(() => {
    appRoot = document.createElement("div")
    appRoot.id = "root"
    document.body.appendChild(appRoot)
})

afterEach(() => {
    appRoot.remove()
})

describe("useModalBehavior", () => {
    it("fechado, não altera o #root nem o body", () => {
        renderPage({ isOpen: false })

        expect(appRoot).not.toHaveAttribute("inert")
        expect(document.body).not.toHaveAttribute("data-scroll-locked")
    })

    it("aberto, marca o #root como inert e trava a rolagem do body, e desfaz ao fechar", () => {
        const { rerender } = renderPage({ isOpen: true })

        expect(appRoot).toHaveAttribute("inert")
        expect(document.body).toHaveAttribute("data-scroll-locked")

        rerender(<Page isOpen={false} />)

        expect(appRoot).not.toHaveAttribute("inert")
        expect(document.body).not.toHaveAttribute("data-scroll-locked")
    })

    it("desfaz o inert e a trava ao desmontar com o modal aberto", () => {
        const { unmount } = renderPage({ isOpen: true })

        unmount()

        expect(appRoot).not.toHaveAttribute("inert")
        expect(document.body).not.toHaveAttribute("data-scroll-locked")
    })

    it("abrir, fechar e abrir de novo não deixa inert nem trava presos", () => {
        const { rerender } = renderPage({ isOpen: true })

        rerender(<Page isOpen={false} />)
        rerender(<Page isOpen />)
        expect(appRoot).toHaveAttribute("inert")

        rerender(<Page isOpen={false} />)

        expect(appRoot).not.toHaveAttribute("inert")
        expect(document.body).not.toHaveAttribute("data-scroll-locked")
    })

    it("leva o foco ao título ao abrir e o devolve à origem ao fechar", () => {
        const { rerender } = renderPage({ isOpen: false })
        const origin = screen.getByRole("button", { name: "Origem" })
        origin.focus()

        rerender(<Page isOpen />)
        expect(screen.getByRole("heading", { name: "Título" })).toHaveFocus()

        rerender(<Page isOpen={false} />)
        expect(origin).toHaveFocus()
    })

    it("Tab no último focável vai ao primeiro e Shift+Tab no primeiro vai ao último", async () => {
        const user = userEvent.setup()
        renderPage({ isOpen: true })
        const first = screen.getByRole("button", { name: "Primeiro" })
        const last = screen.getByRole("button", { name: "Último" })

        last.focus()
        await user.tab()
        expect(first).toHaveFocus()

        await user.tab({ shift: true })
        expect(last).toHaveFocus()
    })

    it("Shift+Tab a partir do título vai ao último focável", async () => {
        const user = userEvent.setup()
        renderPage({ isOpen: true })

        await user.tab({ shift: true })

        expect(screen.getByRole("button", { name: "Último" })).toHaveFocus()
    })

    it("sem focáveis, o foco fica no título ao apertar Tab", async () => {
        const user = userEvent.setup()
        renderPage({ isOpen: true, withFocusables: false })

        await user.tab()

        expect(screen.getByRole("heading", { name: "Título" })).toHaveFocus()
    })

    it("Esc chama o onClose mais recente sem devolver o foco ao título", async () => {
        const user = userEvent.setup()
        const first = vi.fn()
        const latest = vi.fn()
        const { rerender } = renderPage({ isOpen: true, onClose: first })

        screen.getByRole("button", { name: "Primeiro" }).focus()
        rerender(<Page isOpen onClose={latest} />)
        await user.keyboard("{Escape}")

        expect(first).not.toHaveBeenCalled()
        expect(latest).toHaveBeenCalledTimes(1)
        expect(screen.getByRole("button", { name: "Primeiro" })).toHaveFocus()
    })

    it("fechado, Esc não chama o onClose", async () => {
        const user = userEvent.setup()
        const onClose = vi.fn()
        renderPage({ isOpen: false, onClose })

        await user.keyboard("{Escape}")

        expect(onClose).not.toHaveBeenCalled()
    })
})
