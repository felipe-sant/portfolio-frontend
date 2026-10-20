import { renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import usePageTransition from "@/hooks/usePageTransition"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

function stubSystemMotion(reduced: boolean) {
    vi.stubGlobal("matchMedia", () => ({
        matches: reduced,
        addEventListener: () => undefined,
        removeEventListener: () => undefined
    }))
}

afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("usePageTransition", () => {
    it("liga a transição com movimento pleno", () => {
        stubSystemMotion(false)

        const { result } = renderHook(() => usePageTransition())

        expect(result.current).toBe(true)
    })

    it("desliga a transição com movimento reduzido salvo", () => {
        stubSystemMotion(false)
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")

        const { result } = renderHook(() => usePageTransition())

        expect(result.current).toBe(false)
    })

    it("desliga a transição quando o sistema pede movimento reduzido sem escolha salva", () => {
        stubSystemMotion(true)

        const { result } = renderHook(() => usePageTransition())

        expect(result.current).toBe(false)
    })
})
