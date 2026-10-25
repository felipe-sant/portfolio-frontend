import { act, render, renderHook, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import useReveal from "@/hooks/useReveal"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void

function stubObserver() {
    const disconnect = vi.fn()
    const instances: { callback: ObserverCallback }[] = []

    class FakeObserver {
        constructor(callback: ObserverCallback) {
            instances.push({ callback })
        }

        observe = vi.fn()
        unobserve = vi.fn()
        disconnect = disconnect
    }

    vi.stubGlobal("IntersectionObserver", FakeObserver)

    return { disconnect, instances }
}

function Card({ index }: { index?: number }) {
    const { ref, revealProps } = useReveal<HTMLDivElement>(index)

    return <div ref={ref} data-testid="card" {...revealProps} />
}

function stubElementTop(top: number) {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
        top
    } as DOMRect)
}

afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("useReveal", () => {
    it("começa escondido abaixo da dobra e fica visível ao cruzar a viewport", () => {
        const { instances } = stubObserver()
        stubElementTop(5000)

        render(<Card />)

        expect(screen.getByTestId("card")).toHaveAttribute("data-reveal", "hidden")

        act(() => instances[0].callback([{ isIntersecting: true }]))

        expect(screen.getByTestId("card")).toHaveAttribute("data-reveal", "visible")
    })

    it("continua escondido enquanto não há interseção", () => {
        const { instances } = stubObserver()
        stubElementTop(5000)

        render(<Card />)

        act(() => instances[0].callback([{ isIntersecting: false }]))

        expect(screen.getByTestId("card")).toHaveAttribute("data-reveal", "hidden")
    })

    it("desconecta o observer depois de revelar", () => {
        const { instances, disconnect } = stubObserver()
        stubElementTop(5000)

        render(<Card />)
        act(() => instances[0].callback([{ isIntersecting: true }]))

        expect(disconnect).toHaveBeenCalled()
    })

    it("desconecta o observer ao desmontar", () => {
        const { disconnect } = stubObserver()
        stubElementTop(5000)

        const { unmount } = render(<Card />)
        unmount()

        expect(disconnect).toHaveBeenCalled()
    })

    it("mantém visível o que já está na primeira tela", () => {
        const { instances } = stubObserver()
        stubElementTop(100)

        render(<Card />)

        expect(screen.getByTestId("card")).toHaveAttribute("data-reveal", "visible")
        expect(instances).toHaveLength(0)
    })

    it("nasce visível com movimento reduzido", () => {
        stubObserver()
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")

        render(<Card />)

        expect(screen.getByTestId("card")).toHaveAttribute("data-reveal", "visible")
    })

    it("nasce visível sem IntersectionObserver", () => {
        vi.stubGlobal("IntersectionObserver", undefined)

        render(<Card />)

        expect(screen.getByTestId("card")).toHaveAttribute("data-reveal", "visible")
    })

    it("limita o degrau do atraso a 5", () => {
        stubObserver()

        const { result } = renderHook(() => useReveal<HTMLDivElement>(9))

        expect(result.current.revealProps["data-reveal-step"]).toBe(5)
    })

    it("usa o índice como degrau abaixo do limite", () => {
        stubObserver()

        const { result } = renderHook(() => useReveal<HTMLDivElement>(3))

        expect(result.current.revealProps["data-reveal-step"]).toBe(3)
    })
})
