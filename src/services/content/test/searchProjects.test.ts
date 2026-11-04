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

function protoRecord(index: number, title: string, technologies: string[]) {
    return buildProjectRecord({
        id: `0192f1a0-0000-7000-8000-0000000001${String(index).padStart(2, "0")}`,
        title,
        stack: [{ category: "frontend", items: technologies.map((name) => ({ name })) }]
    })
}

const prototype = [
    protoRecord(1, "Maps", ["React", "PostGIS"]),
    protoRecord(2, "Plataforma de cursos", ["React", "Node.js"]),
    protoRecord(3, "Check-in de eventos", ["React Native", "Expo"]),
    protoRecord(4, "Rastreio de entregas", ["React Native", "Firebase"]),
    protoRecord(5, "Catálogo de componentes", ["Storybook", "Vue"]),
    protoRecord(6, "Controle de estoque", ["Prisma", "Express"])
]

function prototypeTitles(query: string) {
    return searchProjects(prototype, query, "pt-BR").map((project) => project.title)
}

describe("searchProjects com os dados do protótipo", () => {
    it("acha Maps por maps", () => {
        expect(prototypeTitles("maps")).toEqual(["Maps"])
    })

    it("acha os quatro projetos com React ou React Native por REACT", () => {
        expect(prototypeTitles("REACT").toSorted()).toEqual([
            "Check-in de eventos",
            "Maps",
            "Plataforma de cursos",
            "Rastreio de entregas"
        ])
    })

    it("acha os dois projetos com React Native por react native", () => {
        expect(prototypeTitles("react native").toSorted()).toEqual([
            "Check-in de eventos",
            "Rastreio de entregas"
        ])
    })

    it("acha Maps por react postgis, catálogo por catalogo e nada por blockchain", () => {
        expect(prototypeTitles("react postgis")).toEqual(["Maps"])
        expect(prototypeTitles("catalogo")).toEqual(["Catálogo de componentes"])
        expect(prototypeTitles("blockchain")).toEqual([])
    })
})
