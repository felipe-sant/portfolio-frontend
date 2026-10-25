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
})
