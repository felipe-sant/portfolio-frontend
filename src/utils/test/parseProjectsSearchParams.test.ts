import { describe, expect, it } from "vitest"
import PROJECT_CATEGORIES from "@/enum/projectCategories.enum"
import PROJECT_SORTS from "@/enum/projectSorts.enum"
import PROJECT_TYPES from "@/enum/projectTypes.enum"
import parseProjectsSearchParams from "@/utils/parseProjectsSearchParams"

function parse(query: string) {
    return parseProjectsSearchParams(new URLSearchParams(query))
}

describe("parseProjectsSearchParams", () => {
    it("devolve o estado padrão para query vazia", () => {
        expect(parse("")).toEqual({ q: "", sort: "recent" })
    })

    it.each([
        ["tipo desconhecido", "type=fullstack"],
        ["tipo vazio", "type="],
        ["categoria desconhecida", "category=hobby"],
        ["categoria vazia", "category="],
        ["ordenação desconhecida", "sort=xyz"],
        ["parâmetro desconhecido", "foo=1"],
        ["lng", "lng=es"],
        ["tema", "tema=dark"]
    ])("ignora %s", (_name, query) => {
        expect(parse(query)).toEqual({ q: "", sort: "recent" })
    })

    it("usa o primeiro valor de parâmetro repetido", () => {
        expect(parse("type=web&type=api")).toEqual({ q: "", type: "web", sort: "recent" })
    })

    it.each(PROJECT_TYPES)("aceita o tipo %s", (type) => {
        expect(parse(`type=${type}`).type).toBe(type)
    })

    it.each(PROJECT_CATEGORIES)("aceita a categoria %s", (category) => {
        expect(parse(`category=${category}`).category).toBe(category)
    })

    it.each(PROJECT_SORTS)("aceita a ordenação %s", (sort) => {
        expect(parse(`sort=${sort}`).sort).toBe(sort)
    })

    it("corta q nos 100 primeiros caracteres e apara", () => {
        expect(parse(`q=${"a".repeat(120)}`).q).toBe("a".repeat(100))
        expect(parse("q=%20%20react%20%20").q).toBe("react")
    })

    it("trata q só com espaços como sem busca", () => {
        expect(parse("q=%20%20%20").q).toBe("")
    })
})
