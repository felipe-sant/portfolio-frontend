import { afterEach, describe, expect, it, vi } from "vitest"
import { act, renderHook } from "@testing-library/react"
import useMediaQuery from "@/hooks/useMediaQuery"

let listener: () => void = () => undefined

function stubMatchMedia(matches: boolean) {
    const mediaQuery = {
        matches,
        addEventListener: vi.fn((_: string, callback: () => void) => {
            listener = callback
        }),
        removeEventListener: vi.fn()
    }

    vi.stubGlobal(
        "matchMedia",
        vi.fn(() => mediaQuery)
    )

    return {
        mediaQuery,
        change(next: boolean) {
            mediaQuery.matches = next
            listener()
        }
    }
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("useMediaQuery", () => {
    it("devolve o valor atual da consulta", () => {
        stubMatchMedia(true)

        const { result } = renderHook(() => useMediaQuery("(pointer: coarse)"))

        expect(result.current).toBe(true)
    })

    it("acompanha a mudança da consulta", () => {
        const stub = stubMatchMedia(false)

        const { result } = renderHook(() => useMediaQuery("(pointer: coarse)"))
        expect(result.current).toBe(false)

        act(() => stub.change(true))

        expect(result.current).toBe(true)
    })

    it("remove o listener ao desmontar", () => {
        const stub = stubMatchMedia(false)

        const { unmount } = renderHook(() => useMediaQuery("(pointer: coarse)"))
        unmount()

        expect(stub.mediaQuery.removeEventListener).toHaveBeenCalled()
    })

    it("devolve falso sem matchMedia", () => {
        vi.stubGlobal("matchMedia", undefined)

        const { result } = renderHook(() => useMediaQuery("(pointer: coarse)"))

        expect(result.current).toBe(false)
    })
})
