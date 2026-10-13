import { afterEach, describe, expect, it, vi } from "vitest"
import readStoredTheme from "@/utils/readStoredTheme"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.removeItem(THEME_STORAGE_KEY)
})

describe("readStoredTheme", () => {
    it.each([["light"], ["dark"]])("devolve o valor salvo %s", (saved) => {
        localStorage.setItem(THEME_STORAGE_KEY, saved)

        expect(readStoredTheme()).toBe(saved)
    })

    it("devolve undefined sem valor salvo", () => {
        expect(readStoredTheme()).toBeUndefined()
    })

    it.each([["blue"], [""], ["DARK"], ["constructor"]])(
        "ignora o valor salvo inválido %j",
        (saved) => {
            localStorage.setItem(THEME_STORAGE_KEY, saved)

            expect(readStoredTheme()).toBeUndefined()
        }
    )

    it("devolve undefined quando o localStorage lança", () => {
        vi.stubGlobal("localStorage", {
            getItem: () => {
                throw new Error("storage bloqueado")
            }
        })

        expect(readStoredTheme()).toBeUndefined()
    })
})
