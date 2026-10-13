import { afterEach, describe, expect, it, vi } from "vitest"
import saveTheme from "@/utils/saveTheme"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.removeItem(THEME_STORAGE_KEY)
})

describe("saveTheme", () => {
    it.each([["light"], ["dark"]] as const)("grava %s na chave do tema", (theme) => {
        saveTheme(theme)

        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(theme)
    })

    it("não lança quando o localStorage lança", () => {
        vi.stubGlobal("localStorage", {
            setItem: () => {
                throw new Error("storage bloqueado")
            }
        })

        expect(() => saveTheme("dark")).not.toThrow()
    })
})
