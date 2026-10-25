import { act, renderHook } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import useMotion from "@/hooks/useMotion"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

type ChangeListener = () => void

function stubSystemMotion(initial: "full" | "reduced") {
    let current = initial
    const listeners = new Set<ChangeListener>()

    vi.stubGlobal("matchMedia", () => ({
        get matches() {
            return current === "reduced"
        },
        addEventListener: (_type: string, listener: ChangeListener) => listeners.add(listener),
        removeEventListener: (_type: string, listener: ChangeListener) => listeners.delete(listener)
    }))

    return (next: "full" | "reduced") => {
        current = next
        listeners.forEach((listener) => listener())
    }
}

afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("useMotion", () => {
    it("segue o sistema em movimento reduzido sem escolha salva", () => {
        stubSystemMotion("reduced")

        const { result } = renderHook(() => useMotion())

        expect(result.current.motion).toBe("reduced")
        expect(document.documentElement).toHaveAttribute("data-motion", "reduced")
        expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBeNull()
    })

    it("segue o sistema em movimento completo sem escolha salva", () => {
        stubSystemMotion("full")

        const { result } = renderHook(() => useMotion())

        expect(result.current.motion).toBe("full")
        expect(document.documentElement).toHaveAttribute("data-motion", "full")
    })

    it("acompanha a mudança do sistema enquanto não há escolha salva", () => {
        const changeSystem = stubSystemMotion("full")
        const { result } = renderHook(() => useMotion())

        act(() => changeSystem("reduced"))

        expect(result.current.motion).toBe("reduced")
        expect(document.documentElement).toHaveAttribute("data-motion", "reduced")
    })

    it("prefere a escolha salva ao sistema", () => {
        stubSystemMotion("reduced")
        localStorage.setItem(MOTION_STORAGE_KEY, "full")

        const { result } = renderHook(() => useMotion())

        expect(result.current.motion).toBe("full")
        expect(document.documentElement).toHaveAttribute("data-motion", "full")
    })

    it("alterna, salva a escolha e aplica no html", () => {
        stubSystemMotion("full")
        const { result } = renderHook(() => useMotion())

        act(() => result.current.toggleMotion())

        expect(result.current.motion).toBe("reduced")
        expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("reduced")
        expect(document.documentElement).toHaveAttribute("data-motion", "reduced")

        act(() => result.current.toggleMotion())

        expect(result.current.motion).toBe("full")
        expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("full")
    })

    it("setMotion grava a escolha informada", () => {
        stubSystemMotion("full")
        const { result } = renderHook(() => useMotion())

        act(() => result.current.setMotion("reduced"))

        expect(result.current.motion).toBe("reduced")
    })
})
