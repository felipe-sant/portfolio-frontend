import { describe, expect, it } from "vitest"
import formatSinceDate from "@/utils/formatSinceDate"

describe("formatSinceDate", () => {
    it.each(["pt-BR", "en", "es"] as const)("formata MM/AAAA em %s", (language) => {
        expect(formatSinceDate("2024-06", language).label).toBe("06/2024")
    })

    it("completa o mês com zero também em es", () => {
        expect(formatSinceDate("2026-01", "es").label).toBe("01/2026")
    })

    it("devolve AAAA-MM para o datetime", () => {
        expect(formatSinceDate("2024-06", "pt-BR").dateTime).toBe("2024-06")
    })

    it("não muda o mês por causa do fuso horário", () => {
        const original = process.env.TZ
        process.env.TZ = "America/Sao_Paulo"

        try {
            expect(formatSinceDate("2026-01", "pt-BR").label).toBe("01/2026")
        } finally {
            process.env.TZ = original
        }
    })
})
