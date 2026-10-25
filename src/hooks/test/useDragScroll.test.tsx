import { describe, expect, it, vi } from "vitest"
import { act, render, renderHook, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
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
    it("rola o elemento ao arrastar com o mouse acima do limiar", () => {
        const { result } = renderHook(() => useDragScroll<HTMLElement>())
        const element = buildElement("auto")
        element.scrollLeft = 100
        result.current.ref.current = element

        act(() => result.current.dragProps.onPointerDown(buildEvent(300)))
        expect(element.dataset.dragging).toBeUndefined()
        expect(element.setPointerCapture).not.toHaveBeenCalled()

        act(() => result.current.dragProps.onPointerMove(buildEvent(250)))
        expect(element.dataset.dragging).toBe("true")
        expect(element.setPointerCapture).toHaveBeenCalledWith(1)
        expect(element.scrollLeft).toBe(150)

        act(() => result.current.dragProps.onPointerUp(buildEvent(250)))
        expect(element.dataset.dragging).toBeUndefined()
        expect(element.releasePointerCapture).toHaveBeenCalledWith(1)

        act(() => result.current.dragProps.onPointerMove(buildEvent(100)))
        expect(element.scrollLeft).toBe(150)
    })

    it("não captura nem marca arrasto em clique sem movimento ou com movimento mínimo", () => {
        const { result } = renderHook(() => useDragScroll<HTMLElement>())
        const element = buildElement("auto")
        element.scrollLeft = 100
        result.current.ref.current = element

        act(() => result.current.dragProps.onPointerDown(buildEvent(300)))
        act(() => result.current.dragProps.onPointerMove(buildEvent(297)))
        act(() => result.current.dragProps.onPointerUp(buildEvent(297)))

        expect(element.dataset.dragging).toBeUndefined()
        expect(element.setPointerCapture).not.toHaveBeenCalled()
        expect(element.scrollLeft).toBe(100)
    })

    it("mantém o clique simples em um botão filho", async () => {
        const onClick = vi.fn()
        const { result } = renderHook(() => useDragScroll<HTMLDivElement>())
        render(
            <div
                ref={result.current.ref}
                style={{ overflowX: "auto" }}
                {...result.current.dragProps}
            >
                <button type="button" onClick={onClick}>
                    {"filtro"}
                </button>
            </div>
        )
        const container = result.current.ref.current as HTMLDivElement
        container.setPointerCapture = vi.fn()

        await userEvent.click(screen.getByRole("button", { name: "filtro" }))

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(container.setPointerCapture).not.toHaveBeenCalled()
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
