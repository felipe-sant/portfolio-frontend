import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import startThemeTransition from "@/utils/startThemeTransition"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"

function stubSystemMotion(reduced: boolean) {
    vi.stubGlobal("matchMedia", () => ({
        matches: reduced,
        addEventListener: () => undefined,
        removeEventListener: () => undefined
    }))
}

beforeEach(() => {
    vi.useFakeTimers()
    stubSystemMotion(false)
})

afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
    vi.unstubAllGlobals()
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-theme-transition")
})

describe("startThemeTransition", () => {
    it("liga o atributo e o remove depois da duração de fallback", () => {
        startThemeTransition()

        expect(document.documentElement).toHaveAttribute("data-theme-transition")

        vi.advanceTimersByTime(179)
        expect(document.documentElement).toHaveAttribute("data-theme-transition")

        vi.advanceTimersByTime(1)
        expect(document.documentElement).not.toHaveAttribute("data-theme-transition")
    })

    it("lê a duração do token --dur-base", () => {
        document.documentElement.style.setProperty("--dur-base", "300ms")

        startThemeTransition()
        vi.advanceTimersByTime(299)
        expect(document.documentElement).toHaveAttribute("data-theme-transition")

        vi.advanceTimersByTime(1)
        expect(document.documentElement).not.toHaveAttribute("data-theme-transition")

        document.documentElement.style.removeProperty("--dur-base")
    })

    it("não liga o atributo com movimento reduzido salvo", () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")

        startThemeTransition()

        expect(document.documentElement).not.toHaveAttribute("data-theme-transition")
    })

    it("não liga o atributo quando o sistema pede movimento reduzido", () => {
        stubSystemMotion(true)

        startThemeTransition()

        expect(document.documentElement).not.toHaveAttribute("data-theme-transition")
    })

    it("não deixa o atributo preso em chamadas seguidas", () => {
        startThemeTransition()
        vi.advanceTimersByTime(100)
        startThemeTransition()
        vi.advanceTimersByTime(100)

        expect(document.documentElement).toHaveAttribute("data-theme-transition")

        vi.advanceTimersByTime(80)
        expect(document.documentElement).not.toHaveAttribute("data-theme-transition")
    })
})
