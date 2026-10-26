import { describe, expect, it } from "vitest"
import buildProjectsQueryArgs from "@/utils/buildProjectsQueryArgs"

describe("buildProjectsQueryArgs", () => {
    it("devolve só o idioma para o estado padrão, sem chaves indefinidas", () => {
        const args = buildProjectsQueryArgs("pt-BR", { q: "", sort: "recent" })

        expect(args).toStrictEqual({ lang: "pt-BR" })
    })

    it("inclui q aparado, tipo, categoria e ordenação diferente de recent", () => {
        expect(
            buildProjectsQueryArgs("en", {
                q: "  react ",
                type: "web",
                category: "personal",
                sort: "title"
            })
        ).toStrictEqual({
            lang: "en",
            q: "react",
            type: "web",
            category: "personal",
            sort: "title"
        })
    })

    it("omite q só com espaços e nunca envia offset nem limit", () => {
        const args = buildProjectsQueryArgs("es", { q: "   ", sort: "oldest" })

        expect(args).toStrictEqual({ lang: "es", sort: "oldest" })
        expect(args).not.toHaveProperty("offset")
        expect(args).not.toHaveProperty("limit")
    })

    it("inclui tech e year só quando não vazios, deduplicados e ordenados", () => {
        expect(
            buildProjectsQueryArgs("pt-BR", {
                q: "",
                tech: ["React", "react", "Node.js"],
                year: ["2025", "2024", "2025"],
                sort: "recent"
            })
        ).toStrictEqual({ lang: "pt-BR", tech: ["Node.js", "React"], year: ["2024", "2025"] })
        expect(
            buildProjectsQueryArgs("pt-BR", { q: "", tech: [], year: [], sort: "recent" })
        ).toStrictEqual({ lang: "pt-BR" })
    })

    it("gera o mesmo argumento para entradas em ordem inversa", () => {
        const forward = buildProjectsQueryArgs("en", {
            q: "",
            tech: ["A", "B"],
            year: ["2024", "2025"],
            sort: "recent"
        })
        const reverse = buildProjectsQueryArgs("en", {
            q: "",
            tech: ["B", "A"],
            year: ["2025", "2024"],
            sort: "recent"
        })

        expect(reverse).toStrictEqual(forward)
    })
})
