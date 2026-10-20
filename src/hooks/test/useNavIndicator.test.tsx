import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import useNavIndicator from "@/hooks/useNavIndicator"

interface HarnessProps {
    active?: string
}

function Harness({ active }: HarnessProps) {
    const { navRef, indicatorStyle, isAnimated } = useNavIndicator()

    return (
        <nav ref={navRef}>
            <a href="#a" aria-current={active === "a" ? "page" : undefined}>
                A
            </a>
            <a href="#b" aria-current={active === "b" ? "page" : undefined}>
                B
            </a>
            <span data-testid="indicator" data-animated={isAnimated} style={indicatorStyle} />
        </nav>
    )
}

function stubOffsets(offsets: Record<string, { left: number; width: number }>) {
    vi.spyOn(HTMLElement.prototype, "offsetLeft", "get").mockImplementation(function (
        this: HTMLElement
    ) {
        return offsets[this.textContent ?? ""]?.left ?? 0
    })
    vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function (
        this: HTMLElement
    ) {
        return offsets[this.textContent ?? ""]?.width ?? 0
    })
}

afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
})

describe("useNavIndicator", () => {
    it("posiciona o indicador sob o item ativo", () => {
        stubOffsets({ A: { left: 0, width: 40 }, B: { left: 64, width: 72 } })

        render(<Harness active="b" />)

        expect(screen.getByTestId("indicator")).toHaveStyle({
            transform: "translateX(64px)",
            width: "72px",
            opacity: "1"
        })
    })

    it("move o indicador quando o item ativo muda", () => {
        stubOffsets({ A: { left: 0, width: 40 }, B: { left: 64, width: 72 } })
        const { rerender } = render(<Harness active="a" />)

        rerender(<Harness active="b" />)

        expect(screen.getByTestId("indicator")).toHaveStyle({ transform: "translateX(64px)" })
    })

    it("esconde o indicador sem item ativo", () => {
        render(<Harness />)

        expect(screen.getByTestId("indicator")).toHaveStyle({ opacity: "0" })
    })

    it("só liga a animação depois da primeira pintura", async () => {
        render(<Harness active="a" />)

        expect(screen.getByTestId("indicator")).toHaveAttribute("data-animated", "false")
        expect(await screen.findByTestId("indicator")).toBeInTheDocument()
        await vi.waitFor(() =>
            expect(screen.getByTestId("indicator")).toHaveAttribute("data-animated", "true")
        )
    })

    it("remede quando o navegador não tem ResizeObserver e a janela muda de tamanho", () => {
        vi.stubGlobal("ResizeObserver", undefined)
        stubOffsets({ A: { left: 0, width: 40 }, B: { left: 64, width: 72 } })
        render(<Harness active="a" />)

        stubOffsets({ A: { left: 0, width: 56 }, B: { left: 64, width: 72 } })
        window.dispatchEvent(new Event("resize"))

        return vi.waitFor(() =>
            expect(screen.getByTestId("indicator")).toHaveStyle({ width: "56px" })
        )
    })

    it("remede quando um item muda de tamanho", () => {
        const callbacks: Array<() => void> = []
        vi.stubGlobal(
            "ResizeObserver",
            class {
                constructor(callback: () => void) {
                    callbacks.push(callback)
                }
                observe() {}
                disconnect() {}
            }
        )
        stubOffsets({ A: { left: 0, width: 40 }, B: { left: 64, width: 72 } })
        render(<Harness active="a" />)

        stubOffsets({ A: { left: 0, width: 56 }, B: { left: 64, width: 72 } })
        callbacks.forEach((callback) => callback())

        return vi.waitFor(() =>
            expect(screen.getByTestId("indicator")).toHaveStyle({ width: "56px" })
        )
    })
})
