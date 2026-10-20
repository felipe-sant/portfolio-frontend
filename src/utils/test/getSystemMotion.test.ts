import { afterEach, describe, expect, it, vi } from "vitest"
import getSystemMotion from "@/utils/getSystemMotion"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("getSystemMotion", () => {
    it("devolve reduced com o sistema pedindo menos movimento", () => {
        vi.stubGlobal("matchMedia", (query: string) => ({
            matches: query === "(prefers-reduced-motion: reduce)"
        }))

        expect(getSystemMotion()).toBe("reduced")
    })

    it("devolve full sem preferência do sistema", () => {
        vi.stubGlobal("matchMedia", () => ({ matches: false }))

        expect(getSystemMotion()).toBe("full")
    })

    it("devolve full sem matchMedia", () => {
        vi.stubGlobal("matchMedia", undefined)

        expect(getSystemMotion()).toBe("full")
    })
})
