import { describe, expect, it } from "vitest"
import buildProjectsSearch from "@/utils/buildProjectsSearch"
import parseProjectsSearchParams from "@/utils/parseProjectsSearchParams"

describe("buildProjectsSearch", () => {
    it("devolve vazio para o estado padrão", () => {
        expect(buildProjectsSearch({ q: "", sort: "recent" })).toBe("")
    })

    it("mantém a ordem q, type, category, sort", () => {
        expect(
            buildProjectsSearch({
                sort: "title",
                category: "academic",
                type: "web",
                q: "react"
            })
        ).toBe("?q=react&type=web&category=academic&sort=title")
    })

    it("omite o que é padrão", () => {
        expect(buildProjectsSearch({ q: "", type: "api", sort: "recent" })).toBe("?type=api")
        expect(buildProjectsSearch({ q: "", sort: "oldest" })).toBe("?sort=oldest")
    })

    it.each(["c#", "node.js", "react native", "a&b=c", "("])("faz a ida e a volta de %s", (q) => {
        const search = buildProjectsSearch({ q, sort: "recent" })

        expect(parseProjectsSearchParams(new URLSearchParams(search)).q).toBe(q)
    })

    it("mantém a ordem q, type, category, tech, year, sort com valores repetidos e ordenados", () => {
        expect(
            buildProjectsSearch({
                sort: "title",
                year: ["2025", "2024"],
                tech: ["React", "Node.js"],
                category: "academic",
                type: "web",
                q: "react"
            })
        ).toBe(
            "?q=react&type=web&category=academic&tech=Node.js&tech=React&year=2024&year=2025&sort=title"
        )
    })

    it("não escreve tech nem year ausentes ou vazios", () => {
        expect(buildProjectsSearch({ q: "", tech: [], year: [], sort: "recent" })).toBe("")
    })
})
