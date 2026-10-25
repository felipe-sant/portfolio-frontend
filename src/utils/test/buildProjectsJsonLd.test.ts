import { describe, expect, it } from "vitest"
import buildProjectsJsonLd from "@/utils/buildProjectsJsonLd"

const LABELS = { title: "Projetos · Luiz Felipe dos Santos", description: "Lista de projetos" }
const SITE_URL = "http://localhost:5173"

const PROJECTS = Array.from({ length: 13 }, (_, index) => ({
    id: `id-${index + 1}`,
    title: `Projeto ${index + 1}`
}))

function readItems(node: ReturnType<typeof buildProjectsJsonLd>) {
    const entity = node.mainEntity
    if (!entity || typeof entity !== "object" || Array.isArray(entity)) {
        throw new Error("mainEntity ausente")
    }
    const items = entity.itemListElement
    if (!Array.isArray(items)) {
        throw new Error("itemListElement ausente")
    }
    return items
}

describe("buildProjectsJsonLd", () => {
    it("monta a CollectionPage sem query na url e com o autor por @id", () => {
        const node = buildProjectsJsonLd("pt-BR", LABELS, PROJECTS)

        expect(node).toMatchObject({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "Projetos · Luiz Felipe dos Santos",
            description: "Lista de projetos",
            url: `${SITE_URL}/pt-BR/projects`,
            inLanguage: "pt-BR",
            author: { "@id": `${SITE_URL}/pt-BR#person` }
        })
        expect(node.url).not.toContain("?")
    })

    it("lista todos os projetos recebidos, com position a partir de 1 e na ordem recebida", () => {
        const items = readItems(buildProjectsJsonLd("en", LABELS, PROJECTS))

        expect(items).toHaveLength(13)
        expect(items[0]).toEqual({
            "@type": "ListItem",
            position: 1,
            url: `${SITE_URL}/en/projects/id-1`,
            name: "Projeto 1"
        })
        expect(items[12]).toMatchObject({ position: 13, name: "Projeto 13" })
    })

    it("usa o idioma na url de cada projeto", () => {
        const items = readItems(buildProjectsJsonLd("es", LABELS, PROJECTS.slice(0, 1)))

        expect(items[0]).toMatchObject({ url: `${SITE_URL}/es/projects/id-1` })
    })

    it("devolve ItemList vazia sem projetos", () => {
        expect(readItems(buildProjectsJsonLd("en", LABELS, []))).toEqual([])
    })
})
