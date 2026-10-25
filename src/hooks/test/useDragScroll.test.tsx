import { describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import type { PointerEvent } from "react"
import useDragScroll from "@/hooks/useDragScroll"

function buildElement(overflowX: string) {
    const element = document.createElement("section")
    element.style.overflowX = overflowX
    element.setPointerCapture = vi.fn()
    element.releasePointerCapture = vi.fn()
    element.hasPointerCapture = vi.fn(() => true)
    return element
}

function buildEvent(clientX: number, pointerType = "mouse", button = 0) {
    return { clientX, pointerType, button, pointerId: 1 } as PointerEvent<HTMLElement>
}

describe("useDragScroll", () => {
    it("rola o elemento ao arrastar com o mouse", () => {
        const { result } = renderHook(() => useDragScroll<HTMLElement>())
        const element = buildElement("auto")
        element.scrollLeft = 100
        result.current.ref.current = element

        act(() => result.current.dragProps.onPointerDown(buildEvent(300)))
        expect(element.dataset.dragging).toBe("true")

        act(() => result.current.dragProps.onPointerMove(buildEvent(250)))
        expect(element.scrollLeft).toBe(150)

        act(() => result.current.dragProps.onPointerUp(buildEvent(250)))
        expect(element.dataset.dragging).toBeUndefined()

        act(() => result.current.dragProps.onPointerMove(buildEvent(100)))
        expect(element.scrollLeft).toBe(150)
    })

    it("ignora toque, botão secundário e elemento sem rolagem", () => {
        const { result } = renderHook(() => useDragScroll<HTMLElement>())
        const scrollable = buildElement("auto")
        result.current.ref.current = scrollable

        act(() => result.current.dragProps.onPointerDown(buildEvent(300, "touch")))
        act(() => result.current.dragProps.onPointerDown(buildEvent(300, "mouse", 2)))
        expect(scrollable.dataset.dragging).toBeUndefined()

        const hidden = buildElement("hidden")
        result.current.ref.current = hidden
        act(() => result.current.dragProps.onPointerDown(buildEvent(300)))
        expect(hidden.dataset.dragging).toBeUndefined()
    })
})
