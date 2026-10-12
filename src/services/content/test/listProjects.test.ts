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
