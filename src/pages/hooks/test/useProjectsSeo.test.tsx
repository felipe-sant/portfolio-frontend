import { describe, expect, it } from "vitest"
import { renderHook } from "@testing-library/react"
import setLanguage from "@/i18n/setLanguage"
import useProjectsSeo from "@/pages/hooks/useProjectsSeo"
import buildProjectSummary from "@/testUtils/buildProjectSummary"

const ITEMS = [
    buildProjectSummary({ id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c1", title: "Primeiro" }),
    buildProjectSummary({ id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c2", title: "Segundo" })
]

const EXPECTED = {
    "pt-BR": {
        title: "Projetos · Luiz Felipe dos Santos",
        description:
            "Projetos de Luiz Felipe dos Santos, com busca por tipo, categoria e tecnologia.",
        home: "Início",
        projects: "Projetos"
    },
    en: {
        title: "Projects · Luiz Felipe dos Santos",
        description:
            "Projects by Luiz Felipe dos Santos, with search by type, category and technology.",
        home: "Home",
        projects: "Projects"
    },
    es: {
        title: "Proyectos · Luiz Felipe dos Santos",
        description:
            "Proyectos de Luiz Felipe dos Santos, con búsqueda por tipo, categoría y tecnología.",
        home: "Inicio",
        projects: "Proyectos"
    }
} as const

describe("useProjectsSeo", () => {
    it("devolve os dois JSON-LD indefinidos sem itens", () => {
        const { result } = renderHook(() => useProjectsSeo(undefined))

        expect(result.current).toEqual({ jsonLd: undefined, breadcrumbJsonLd: undefined })
    })

    it.each(["pt-BR", "en", "es"] as const)(
        "lista os itens com título e descrição de %s e monta o breadcrumb com o prefixo do idioma",
        async (language) => {
            await setLanguage(language)
            const expected = EXPECTED[language]

            const { result } = renderHook(() => useProjectsSeo(ITEMS))

            expect(result.current.jsonLd).toMatchObject({
                "@type": "CollectionPage",
                name: expected.title,
                description: expected.description,
                inLanguage: language,
                mainEntity: {
                    "@type": "ItemList",
                    itemListElement: [
                        { position: 1, name: "Primeiro" },
                        { position: 2, name: "Segundo" }
                    ]
                }
            })
            expect(result.current.breadcrumbJsonLd).toMatchObject({
                "@type": "BreadcrumbList",
                itemListElement: [
                    { position: 1, name: expected.home },
                    { position: 2, name: expected.projects }
                ]
            })
            const urls = JSON.stringify(result.current.breadcrumbJsonLd)

            expect(urls).toContain(`/${language}"`)
            expect(urls).toContain(`/${language}/projects"`)
        }
    )
})
