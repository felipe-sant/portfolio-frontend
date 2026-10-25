import { describe, expect, it } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import useDropdown from "@/hooks/useDropdown"

function Harness() {
    const { isMounted, toggle, containerRef, buttonRef, panelProps } = useDropdown()

    return (
        <div>
            <div ref={containerRef}>
                <button ref={buttonRef} onClick={toggle}>
                    Alternar
                </button>
                {isMounted && (
                    <a href="#item" {...panelProps}>
                        Item
                    </a>
                )}
            </div>
            <button
                onClick={(event) =>
                    panelProps.onAnimationEnd({
                        target: event.currentTarget,
                        currentTarget: event.currentTarget
                    } as never)
                }
            >
                Fim
            </button>
            <button>Fora</button>
        </div>
    )
}

describe("useDropdown", () => {
    it("abre e fecha pelo botão", async () => {
        render(<Harness />)

        await userEvent.click(screen.getByText("Alternar"))
        expect(screen.getByText("Item")).toBeInTheDocument()

        await userEvent.click(screen.getByText("Alternar"))
        await waitFor(() => expect(screen.queryByText("Item")).not.toBeInTheDocument())
    })

    it("fecha com Escape e foca o botão", async () => {
        render(<Harness />)
        await userEvent.click(screen.getByText("Alternar"))

        await userEvent.keyboard("{Escape}")

        await waitFor(() => expect(screen.queryByText("Item")).not.toBeInTheDocument())
        expect(screen.getByText("Alternar")).toHaveFocus()
    })

    it("fecha ao clicar fora", async () => {
        render(<Harness />)
        await userEvent.click(screen.getByText("Alternar"))

        await userEvent.click(screen.getByText("Fora"))

        await waitFor(() => expect(screen.queryByText("Item")).not.toBeInTheDocument())
    })

    it("fecha quando o foco sai do contêiner", async () => {
        render(<Harness />)
        await userEvent.click(screen.getByText("Alternar"))

        await userEvent.tab()
        await userEvent.tab()

        await waitFor(() => expect(screen.queryByText("Item")).not.toBeInTheDocument())
    })

    it("marca o painel como fechado e inerte enquanto sai", async () => {
        render(<Harness />)
        await userEvent.click(screen.getByText("Alternar"))
        expect(screen.getByText("Item")).toHaveAttribute("data-state", "open")

        await userEvent.click(screen.getByText("Alternar"))

        expect(screen.getByText("Item")).toHaveAttribute("data-state", "closed")
        expect(screen.getByText("Item")).toHaveAttribute("inert")
    })

    it("desmonta ao fim da animação de saída", async () => {
        render(<Harness />)
        await userEvent.click(screen.getByText("Alternar"))
        await userEvent.click(screen.getByText("Alternar"))

        await userEvent.click(screen.getByText("Fim"))

        expect(screen.queryByText("Item")).not.toBeInTheDocument()
    })

    it("reabre durante a saída sem desmontar", async () => {
        render(<Harness />)
        await userEvent.click(screen.getByText("Alternar"))
        await userEvent.click(screen.getByText("Alternar"))

        await userEvent.click(screen.getByText("Alternar"))
        expect(screen.getByText("Item")).toHaveAttribute("data-state", "open")
    })

    it("mantém aberto ao clicar dentro", async () => {
        render(<Harness />)
        await userEvent.click(screen.getByText("Alternar"))

        await userEvent.click(screen.getByText("Item"))

        expect(screen.getByText("Item")).toBeInTheDocument()
    })
})
