import { describe, expect, it } from "vitest"
import hasProjectsFilters from "@/utils/hasProjectsFilters"

describe("hasProjectsFilters", () => {
    it("é falso com a ordenação diferente do padrão", () => {
        expect(hasProjectsFilters({ q: "", sort: "title" })).toBe(false)
    })

    it.each([
        ["busca", { q: "react", sort: "recent" as const }],
        ["tipo", { q: "", type: "web" as const, sort: "recent" as const }],
        ["categoria", { q: "", category: "personal" as const, sort: "recent" as const }],
        ["tecnologia", { q: "", tech: ["React"], sort: "recent" as const }],
        ["ano", { q: "", year: ["2025"], sort: "recent" as const }]
    ])("é verdadeiro com %s", (_name, filters) => {
        expect(hasProjectsFilters(filters)).toBe(true)
    })

    it("é falso com tech e year vazios", () => {
        expect(hasProjectsFilters({ q: "", tech: [], year: [], sort: "recent" })).toBe(false)
    })
})
