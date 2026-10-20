import { afterEach, describe, expect, it, vi } from "vitest"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"
import saveMotion from "@/utils/saveMotion"

afterEach(() => {
    vi.unstubAllGlobals()
    localStorage.removeItem(MOTION_STORAGE_KEY)
})

describe("saveMotion", () => {
    it("grava a escolha na chave de movimento", () => {
        saveMotion("reduced")

        expect(localStorage.getItem(MOTION_STORAGE_KEY)).toBe("reduced")
    })

    it("não lança quando o localStorage lança", () => {
        vi.stubGlobal("localStorage", {
            setItem: () => {
                throw new Error("storage bloqueado")
            }
        })

        expect(() => saveMotion("full")).not.toThrow()
    })
})
