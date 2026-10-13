import { describe, expect, it } from "vitest"
import ContentException from "@/services/content/ContentException"
import validateProjectListParams from "@/services/content/validateProjectListParams"

function fieldsOf(params: Parameters<typeof validateProjectListParams>[0]) {
    try {
        validateProjectListParams(params)
    } catch (error) {
        if (error instanceof ContentException) {
            return error.contentError.data.error.fields
        }
        throw error
    }
    return undefined
}

describe("validateProjectListParams", () => {
    it("aplica os padrões quando só o idioma é informado", () => {
        expect(validateProjectListParams({ lang: "pt-BR" })).toEqual({
            lang: "pt-BR",
            q: undefined,
            type: undefined,
            category: undefined,
            featured: undefined,
            sort: "recent",
            offset: 0,
            limit: 9
        })
    })

    it("mantém os parâmetros válidos", () => {
        expect(
            validateProjectListParams({
                lang: "en",
                q: "react",
                type: "web",
                category: "personal",
                featured: true,
                sort: "title",
                offset: 9,
                limit: 50
            })
        ).toEqual({
            lang: "en",
            q: "react",
            type: "web",
            category: "personal",
            featured: true,
            sort: "title",
            offset: 9,
            limit: 50
        })
    })

    it("rejeita idioma inválido com UNSUPPORTED_LANGUAGE", () => {
        expect(() => validateProjectListParams({ lang: "fr" })).toThrow(ContentException)
    })

    it("rejeita q com mais de 100 caracteres", () => {
        expect(fieldsOf({ lang: "en", q: "a".repeat(101) })).toEqual([
            expect.objectContaining({ field: "q", code: "TOO_LONG" })
        ])
    })

    it("rejeita q que não é texto", () => {
        expect(fieldsOf({ lang: "en", q: 10 })).toEqual([
            expect.objectContaining({ field: "q", code: "INVALID_VALUE" })
        ])
    })

    it.each([
        ["type", { type: "fullstack" }],
        ["category", { category: "hobby" }],
        ["featured", { featured: false }],
        ["sort", { sort: "random" }],
        ["offset", { offset: -1 }],
        ["offset", { offset: 1.5 }],
        ["limit", { limit: 0 }],
        ["limit", { limit: 51 }],
        ["limit", { limit: "9" }]
    ])("rejeita %s inválido com INVALID_VALUE", (field, extra) => {
        expect(fieldsOf({ lang: "pt-BR", ...extra })).toEqual([
            expect.objectContaining({ field, code: "INVALID_VALUE" })
        ])
    })

    it("junta todos os campos inválidos em um único erro 400", () => {
        const fields = fieldsOf({ lang: "pt-BR", sort: "x", limit: 0 })

        expect(fields?.map((issue) => issue.field)).toEqual(["sort", "limit"])
    })
})
