import { describe, expect, it } from "vitest"
import isWithinKilobytes from "@scripts/isWithinKilobytes"

describe("isWithinKilobytes", () => {
    it("aceita exatamente o limite, contando 1 KB como 1024 bytes", () => {
        expect(isWithinKilobytes(300 * 1024, 300)).toBe(true)
    })

    it("rejeita um byte acima do limite", () => {
        expect(isWithinKilobytes(300 * 1024 + 1, 300)).toBe(false)
    })

    it("aceita arquivo menor que o limite", () => {
        expect(isWithinKilobytes(1, 300)).toBe(true)
    })
})
