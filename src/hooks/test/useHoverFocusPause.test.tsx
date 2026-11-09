import { describe, expect, it } from "vitest"
import { act, renderHook } from "@testing-library/react"
import type { FocusEvent, PointerEvent } from "react"
import useHoverFocusPause from "@/hooks/useHoverFocusPause"

function buildPointerEvent(pointerType: string) {
    return { pointerType } as PointerEvent<HTMLElement>
}

function buildBlurEvent(relatedTarget: Node | null, region: HTMLElement) {
    return { relatedTarget, currentTarget: region } as unknown as FocusEvent<HTMLElement>
}

describe("useHoverFocusPause", () => {
    it("começa sem pausa", () => {
        const { result } = renderHook(() => useHoverFocusPause<HTMLElement>())

        expect(result.current.isPaused).toBe(false)
    })

    it("pausa quando o mouse entra e retoma quando sai", () => {
        const { result } = renderHook(() => useHoverFocusPause<HTMLElement>())

        act(() => result.current.pauseProps.onPointerEnter(buildPointerEvent("mouse")))
        expect(result.current.isPaused).toBe(true)

        act(() => result.current.pauseProps.onPointerLeave(buildPointerEvent("mouse")))
        expect(result.current.isPaused).toBe(false)
    })

    it("não pausa com toque nem caneta", () => {
        const { result } = renderHook(() => useHoverFocusPause<HTMLElement>())

        act(() => result.current.pauseProps.onPointerEnter(buildPointerEvent("touch")))
        expect(result.current.isPaused).toBe(false)

        act(() => result.current.pauseProps.onPointerEnter(buildPointerEvent("pen")))
        expect(result.current.isPaused).toBe(false)
    })

    it("pausa quando o foco entra e retoma quando sai para fora da região", () => {
        const { result } = renderHook(() => useHoverFocusPause<HTMLElement>())
        const region = document.createElement("section")

        act(() => result.current.pauseProps.onFocus())
        expect(result.current.isPaused).toBe(true)

        act(() => result.current.pauseProps.onBlur(buildBlurEvent(null, region)))
        expect(result.current.isPaused).toBe(false)
    })

    it("não retoma quando o foco passa para dentro da região", () => {
        const { result } = renderHook(() => useHoverFocusPause<HTMLElement>())
        const region = document.createElement("section")
        const inner = document.createElement("button")
        region.append(inner)

        act(() => result.current.pauseProps.onFocus())
        act(() => result.current.pauseProps.onBlur(buildBlurEvent(inner, region)))

        expect(result.current.isPaused).toBe(true)
    })

    it("continua pausado enquanto mouse ou foco seguem dentro", () => {
        const { result } = renderHook(() => useHoverFocusPause<HTMLElement>())
        const region = document.createElement("section")

        act(() => result.current.pauseProps.onPointerEnter(buildPointerEvent("mouse")))
        act(() => result.current.pauseProps.onFocus())
        act(() => result.current.pauseProps.onPointerLeave(buildPointerEvent("mouse")))
        expect(result.current.isPaused).toBe(true)

        act(() => result.current.pauseProps.onBlur(buildBlurEvent(null, region)))
        expect(result.current.isPaused).toBe(false)

        act(() => result.current.pauseProps.onPointerEnter(buildPointerEvent("mouse")))
        act(() => result.current.pauseProps.onFocus())
        act(() => result.current.pauseProps.onBlur(buildBlurEvent(null, region)))
        expect(result.current.isPaused).toBe(true)
    })
})
