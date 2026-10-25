import { describe, expect, it } from "vitest"
import buildFeaturedProjectsParams from "@/utils/buildFeaturedProjectsParams"

describe("buildFeaturedProjectsParams", () => {
    it.each(["pt-BR", "en", "es"] as const)(
        "pede até quatro destaques recentes em %s",
        (language) => {
            expect(buildFeaturedProjectsParams(language)).toEqual({
                lang: language,
                featured: true,
                sort: "recent",
                limit: 4
            })
        }
    )
})
