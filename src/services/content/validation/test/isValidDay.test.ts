import { describe, expect, it } from "vitest"
import isValidDay from "@/services/content/validation/isValidDay"
import isValidMonth from "@/services/content/validation/isValidMonth"

describe("datas do conteúdo", () => {
    it("valida o dia no formato AAAA-MM-DD", () => {
        expect(isValidDay("2026-02-28")).toBe(true)
        expect(isValidDay("2024-02-29")).toBe(true)
        expect(isValidDay("2026-02-29")).toBe(false)
        expect(isValidDay("2026-13-01")).toBe(false)
        expect(isValidDay("2026-02")).toBe(false)
        expect(isValidDay(20260228)).toBe(false)
    })

    it("valida o mês no formato AAAA-MM", () => {
        expect(isValidMonth("2026-12")).toBe(true)
        expect(isValidMonth("2026-00")).toBe(false)
        expect(isValidMonth("2026-12-01")).toBe(false)
        expect(isValidMonth(undefined)).toBe(false)
    })
})
