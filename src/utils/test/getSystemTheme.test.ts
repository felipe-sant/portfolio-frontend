import { afterEach, describe, expect, it, vi } from "vitest"
import getSystemTheme from "@/utils/getSystemTheme"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("getSystemTheme", () => {
    it("devolve dark com o sistema em escuro", () => {
        vi.stubGlobal("matchMedia", (query: string) => ({
            matches: query === "(prefers-color-scheme: dark)"
        }))

        expect(getSystemTheme()).toBe("dark")
    })

    it("devolve light com o sistema em claro", () => {
        vi.stubGlobal("matchMedia", () => ({ matches: false }))

        expect(getSystemTheme()).toBe("light")
    })

    it("devolve light sem matchMedia", () => {
        vi.stubGlobal("matchMedia", undefined)

        expect(getSystemTheme()).toBe("light")
    })
})
