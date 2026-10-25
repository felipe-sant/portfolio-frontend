import { afterEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import Reveal from "@/components/Reveal"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void

function stubObserver() {
    const callbacks: ObserverCallback[] = []

    class FakeObserver {
        constructor(callback: ObserverCallback) {
            callbacks.push(callback)
        }

        observe = vi.fn()
        disconnect = vi.fn()
    }

    vi.stubGlobal("IntersectionObserver", FakeObserver)

    return callbacks
}

afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("Reveal", () => {
    it("esconde o conteúdo até cruzar a viewport e depois o revela", () => {
        const callbacks = stubObserver()
        vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
            top: 5000
        } as DOMRect)

        render(
            <Reveal>
                <p>Conteúdo</p>
            </Reveal>
        )

        const wrapper = screen.getByText("Conteúdo").parentElement
        expect(wrapper).toHaveAttribute("data-reveal", "hidden")

        act(() => callbacks[0]([{ isIntersecting: true }]))

        expect(wrapper).toHaveAttribute("data-reveal", "visible")
    })

    it("mantém o conteúdo visível com movimento reduzido", () => {
        stubObserver()
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")

        render(
            <Reveal>
                <p>Conteúdo</p>
            </Reveal>
        )

        expect(screen.getByText("Conteúdo").parentElement).toHaveAttribute("data-reveal", "visible")
    })
})
