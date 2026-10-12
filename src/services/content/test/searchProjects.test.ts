import { describe, expect, it } from "vitest"
import searchProjects from "@/services/content/searchProjects"
import buildProjectRecord from "@/testUtils/buildProjectRecord"

const maps = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-000000000001",
    title: "Maps",
    stack: [
        { category: "frontend", items: [{ name: "React" }] },
        { category: "backend", items: [{ name: "Node.js" }, { name: "PostGIS" }] }
    ]
})
const catalog = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-000000000002",
    title: "Catálogo de componentes",
    stack: [{ category: "frontend", items: [{ name: "React" }, { name: "Storybook" }] }]
})
const sharp = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-000000000003",
    title: "Analisador",
    stack: [{ category: "backend", items: [{ name: "C#" }, { name: "SQL Server" }] }]
})
const projects = [maps, catalog, sharp]

function titles(query: string | undefined) {
    return searchProjects(projects, query, "pt-BR").map((project) => project.title)
}

describe("searchProjects", () => {
    it("devolve todos sem busca ou com busca só de espaços", () => {
        expect(titles(undefined)).toHaveLength(3)
        expect(titles("   ")).toHaveLength(3)
    })

    it("combina palavras por e, em campos diferentes", () => {
        expect(titles("react postgis")).toEqual(["Maps"])
    })

    it("ignora acento e caixa", () => {
        expect(titles("catalogo")).toEqual(["Catálogo de componentes"])
    })

    it("busca em tecnologias que não aparecem no card", () => {
        expect(titles("storybook")).toEqual(["Catálogo de componentes"])
    })

    it("devolve vazio quando nada casa", () => {
        expect(titles("blockchain")).toEqual([])
    })

    it("trata c# e node.js como texto literal", () => {
        expect(titles("c#")).toEqual(["Analisador"])
        expect(titles("node.js")).toEqual(["Maps"])
        expect(titles("node.js ")).toEqual(["Maps"])
        expect(titles(".")).toEqual(["Maps"])
    })

    it("não busca no resumo", () => {
        expect(titles("colaborativo")).toEqual([])
    })
})
