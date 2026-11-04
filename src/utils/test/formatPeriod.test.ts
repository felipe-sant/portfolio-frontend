import { describe, expect, it } from "vitest"
import formatPeriod from "@/utils/formatPeriod"
import formatSinceDate from "@/utils/formatSinceDate"

describe("formatPeriod", () => {
    it("marca o período em curso quando não há fim", () => {
        const period = formatPeriod("2026-06", undefined, "pt-BR")

        expect(period.isCurrent).toBe(true)
        expect(period.end).toBeUndefined()
        expect(period.start).toEqual({ label: "06/2026", dateTime: "2026-06" })
    })

    it.each(["pt-BR", "en", "es"] as const)("formata início e fim em MM/AAAA em %s", (language) => {
        const period = formatPeriod("2024-06", "2026-05", language)

        expect(period.isCurrent).toBe(false)
        expect(period.start).toEqual({ label: "06/2024", dateTime: "2024-06" })
        expect(period.end).toEqual({ label: "05/2026", dateTime: "2026-05" })
    })

    it("mantém início e fim no mesmo mês e janeiro sem deslocar por fuso", () => {
        const original = process.env.TZ
        process.env.TZ = "America/Sao_Paulo"

        try {
            const period = formatPeriod("2026-01", "2026-01", "pt-BR")

            expect(period.start.label).toBe("01/2026")
            expect(period.end?.label).toBe("01/2026")
        } finally {
            process.env.TZ = original
        }
    })

    it("compõe formatSinceDate para o início", () => {
        expect(formatPeriod("2024-06", "2026-05", "es").start).toEqual(
            formatSinceDate("2024-06", "es")
        )
    })
})
