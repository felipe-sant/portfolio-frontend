import { describe, expect, it } from "vitest"
import buildProjectSummary from "@/testUtils/buildProjectSummary"
import formatProjectMeta from "@/utils/formatProjectMeta"

describe("formatProjectMeta", () => {
    it("devolve os tipos na ordem, a categoria e o ano da data", () => {
        const project = buildProjectSummary({
            types: ["web", "api"],
            category: "academic",
            date: "2025-11"
        })

        expect(formatProjectMeta(project)).toEqual({
            types: ["web", "api"],
            category: "academic",
            year: "2025"
        })
    })

    it("não depende do fuso horário no ano de janeiro", () => {
        expect(formatProjectMeta(buildProjectSummary({ date: "2026-01" })).year).toBe("2026")
    })
})
