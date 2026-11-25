import { describe, expect, it } from "vitest"
import listProjects from "@/services/content/listProjects"
import validateProjectListParams from "@/services/content/validateProjectListParams"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import type ProjectListParams from "@/types/project/ProjectListParams.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

function build(index: number, overrides: Partial<ProjectRecord> = {}) {
    return buildProjectRecord({
        id: `0192f1a0-0000-7000-8000-0000000000${String(index).padStart(2, "0")}`,
        title: `Projeto ${String.fromCharCode(64 + index)}`,
        date: `2026-${String(index).padStart(2, "0")}`,
        ...overrides
    })
}

const records = [
    build(1, { types: ["web", "api"], featured: true }),
    build(2, { types: ["mobile"], category: "academic" }),
    build(3, { types: ["web"], featured: true, category: "professional" }),
    build(4, { types: ["library"] }),
    build(5, { types: ["web"], title: "Catálogo" })
]

function list(params: Omit<ProjectListParams, "lang">) {
    return listProjects(records, validateProjectListParams({ lang: "pt-BR", ...params }))
}

describe("listProjects", () => {
    it("devolve a primeira página, do mais recente, com total, offset, limit e tipos", () => {
        const page = list({})

        expect(page.items.map((item) => item.date)).toEqual([
            "2026-05",
            "2026-04",
            "2026-03",
            "2026-02",
            "2026-01"
        ])
        expect(page).toMatchObject({ total: 5, offset: 0, limit: 9 })
        expect(page.availableTypes).toEqual(["web", "mobile", "api", "library"])
    })

    it("pagina por offset e limit sem alterar o total", () => {
        const page = list({ limit: 2, offset: 2 })

        expect(page.items.map((item) => item.date)).toEqual(["2026-03", "2026-02"])
        expect(page).toMatchObject({ total: 5, offset: 2, limit: 2 })
    })

    it("devolve items vazio com offset além do fim e o total real", () => {
        const page = list({ offset: 20 })

        expect(page.items).toEqual([])
        expect(page.total).toBe(5)
    })

    it("combina filtros por e e mantém availableTypes", () => {
        const page = list({ type: "web", category: "professional", q: "projeto" })

        expect(page.items.map((item) => item.date)).toEqual(["2026-03"])
        expect(page.total).toBe(1)
        expect(page.availableTypes).toEqual(["web", "mobile", "api", "library"])
    })

    it("filtra destaques e desempata datas iguais por título", () => {
        const tied = [
            build(1, { featured: true, date: "2026-03", title: "Zebra" }),
            build(2, { featured: true, date: "2026-03", title: "Árvore" }),
            build(3, { featured: false, date: "2026-04" })
        ]

        const page = listProjects(
            tied,
            validateProjectListParams({ lang: "pt-BR", featured: true, sort: "recent", limit: 4 })
        )

        expect(page.items.map((item) => item.title)).toEqual(["Árvore", "Zebra"])
    })

    it("devolve vazio com total 0 quando a busca não casa", () => {
        const page = list({ q: "blockchain" })

        expect(page).toMatchObject({ items: [], total: 0 })
        expect(page.availableTypes).toHaveLength(4)
    })

    it("ordena por título", () => {
        expect(list({ sort: "title" }).items[0].title).toBe("Catálogo")
    })
})

function protoRecord(
    index: number,
    title: string,
    types: ProjectRecord["types"],
    category: ProjectRecord["category"],
    technology: string
) {
    return buildProjectRecord({
        id: `0192f1a0-0000-7000-8000-0000000002${String(index).padStart(2, "0")}`,
        title,
        types,
        category,
        stack: [{ category: "frontend", items: [{ name: technology }] }]
    })
}

const prototype = [
    protoRecord(1, "Maps", ["web"], "personal", "React"),
    protoRecord(2, "Plataforma de cursos", ["web"], "academic", "React"),
    protoRecord(3, "Controle de estoque", ["web"], "academic", "Prisma"),
    protoRecord(4, "Catálogo de componentes", ["web"], "personal", "Storybook"),
    protoRecord(5, "Painel de métricas", ["web"], "professional", "D3"),
    protoRecord(6, "Check-in de eventos", ["mobile"], "personal", "React Native"),
    protoRecord(7, "Rastreio de entregas", ["mobile"], "academic", "React Native"),
    protoRecord(8, "Gateway de pagamentos", ["api"], "professional", "Node.js")
]

function listPrototype(params: Omit<ProjectListParams, "lang">) {
    return listProjects(prototype, validateProjectListParams({ lang: "pt-BR", ...params }))
}

describe("listProjects com os dados do protótipo", () => {
    it("filtra por tipo Web e devolve cinco", () => {
        expect(listPrototype({ type: "web" }).total).toBe(5)
    })

    it("combina Web e Acadêmicos e devolve dois", () => {
        expect(
            listPrototype({ type: "web", category: "academic", sort: "title" }).items.map(
                (item) => item.title
            )
        ).toEqual(["Controle de estoque", "Plataforma de cursos"])
    })

    it("combina Web, Acadêmicos e prisma e devolve Controle de estoque", () => {
        expect(
            listPrototype({ type: "web", category: "academic", q: "prisma" }).items.map(
                (item) => item.title
            )
        ).toEqual(["Controle de estoque"])
    })

    it("devolve vazio para Mobile e Profissionais", () => {
        const page = listPrototype({ type: "mobile", category: "professional" })

        expect(page.items).toEqual([])
        expect(page.total).toBe(0)
    })

    it("filtra por uma tecnologia", () => {
        expect(
            listPrototype({ tech: ["React"], sort: "title" }).items.map((item) => item.title)
        ).toEqual(["Maps", "Plataforma de cursos"])
    })

    it("combina tecnologias por e", () => {
        const withTwo = [
            protoRecord(1, "Plataforma de cursos", ["web"], "academic", "React"),
            buildProjectRecord({
                id: "0192f1a0-0000-7000-8000-000000000299",
                title: "Fullstack",
                stack: [
                    {
                        category: "frontend",
                        items: [{ name: "React" }, { name: "Node.js" }]
                    }
                ]
            }),
            protoRecord(8, "Gateway de pagamentos", ["api"], "professional", "Node.js")
        ]

        const page = listProjects(
            withTwo,
            validateProjectListParams({ lang: "pt-BR", tech: ["React", "Node.js"] })
        )

        expect(page.items.map((item) => item.title)).toEqual(["Fullstack"])
    })

    it("compara a tecnologia pelo texto normalizado", () => {
        expect(listPrototype({ tech: ["react"] }).total).toBe(2)
        expect(listPrototype({ tech: ["node.JS"] }).total).toBe(1)
    })

    it("devolve vazio para tecnologia inexistente", () => {
        const page = listPrototype({ tech: ["Inexistente"] })

        expect(page.items).toEqual([])
        expect(page.total).toBe(0)
    })

    it("filtra por ano e combina anos por ou", () => {
        const dated = [
            build(1, { date: "2024-01" }),
            build(2, { date: "2025-06" }),
            build(3, { date: "2026-02" })
        ]
        const run = (year: string[]) =>
            listProjects(dated, validateProjectListParams({ lang: "pt-BR", year }))
                .items.map((item) => item.date)
                .toSorted()

        expect(run(["2025"])).toEqual(["2025-06"])
        expect(run(["2024", "2026"])).toEqual(["2024-01", "2026-02"])
    })

    it("combina tech e year com type, category e q por e", () => {
        const page = listPrototype({
            tech: ["Prisma"],
            year: ["2026"],
            type: "web",
            category: "academic",
            q: "estoque"
        })

        expect(page.items.map((item) => item.title)).toEqual(["Controle de estoque"])
        expect(listPrototype({ tech: ["Prisma"], type: "web", category: "personal" }).total).toBe(0)
        expect(listPrototype({ year: ["2020"], type: "web", category: "academic" }).total).toBe(0)
    })

    it("aplica offset e limit depois do filtro e totaliza o filtrado", () => {
        const page = listPrototype({ tech: ["React Native"], limit: 1, offset: 1, sort: "title" })

        expect(page.items.map((item) => item.title)).toEqual(["Rastreio de entregas"])
        expect(page).toMatchObject({ total: 2, offset: 1, limit: 1 })
    })

    it("só expõe os campos do contrato de ProjectPage", () => {
        const page = listPrototype({})

        expect(Object.keys(page).toSorted()).toEqual([
            "availableTypes",
            "items",
            "limit",
            "offset",
            "total"
        ])
    })
})
