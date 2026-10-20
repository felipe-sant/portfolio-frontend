import { afterEach, describe, expect, it, vi } from "vitest"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"
import readStoredMotion from "@/utils/readStoredMotion"

afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.removeItem(MOTION_STORAGE_KEY)
})

describe("readStoredMotion", () => {
    it.each([["full"], ["reduced"]])("devolve o valor salvo %s", (saved) => {
        localStorage.setItem(MOTION_STORAGE_KEY, saved)

        expect(readStoredMotion()).toBe(saved)
    })

    it("devolve undefined sem valor salvo", () => {
        expect(readStoredMotion()).toBeUndefined()
    })

    it.each([["none"], [""], ["REDUCED"], ["constructor"]])(
        "ignora o valor salvo inválido %j",
        (saved) => {
            localStorage.setItem(MOTION_STORAGE_KEY, saved)

            expect(readStoredMotion()).toBeUndefined()
        }
    )

    it("devolve undefined quando o localStorage lança", () => {
        vi.stubGlobal("localStorage", {
            getItem: () => {
                throw new Error("storage bloqueado")
            }
        })

        expect(readStoredMotion()).toBeUndefined()
    })
})
