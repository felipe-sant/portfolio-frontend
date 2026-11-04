import { describe, expect, it } from "vitest"
import listProjectFilterOptions from "@/services/content/listProjectFilterOptions"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import type StackGroup from "@/types/content/StackGroup.types"

function stackOf(...names: string[]): StackGroup[] {
    return [{ category: "frontend", items: names.map((name) => ({ name })) }]
}

function recordWith(date: string, ...names: string[]) {
    return buildProjectRecord({ date, stack: stackOf(...names) })
}

describe("listProjectFilterOptions", () => {
    it("sem projeto e sem stack no perfil devolve listas vazias", () => {
        expect(listProjectFilterOptions([], [], "pt-BR")).toStrictEqual({
            technologies: [],
            years: []
        })
    })

    it("sem projeto, cada item da stack do perfil entra com count 0 e os anos ficam vazios", () => {
        expect(listProjectFilterOptions([], stackOf("Redis", "Docker"), "pt-BR")).toStrictEqual({
            technologies: [
                { value: "Docker", count: 0 },
                { value: "Redis", count: 0 }
            ],
            years: []
        })
    })

    it("une a stack do perfil com as tecnologias dos projetos e conta os projetos de cada uma", () => {
        const { technologies } = listProjectFilterOptions(
            [recordWith("2026-01", "React", "Leaflet"), recordWith("2025-01", "React")],
            stackOf("React", "Docker"),
            "pt-BR"
        )

        expect(technologies).toStrictEqual([
            { value: "Docker", count: 0 },
            { value: "Leaflet", count: 1 },
            { value: "React", count: 2 }
        ])
    })

    it("conta uma só vez o mesmo nome com caixa ou acento diferente, com a grafia do perfil", () => {
        const { technologies } = listProjectFilterOptions(
            [
                recordWith("2026-01", "react"),
                recordWith("2025-01", "REACT"),
                recordWith("2024-01", "Árvore")
            ],
            stackOf("React", "Arvore"),
            "pt-BR"
        )

        expect(technologies).toStrictEqual([
            { value: "Arvore", count: 1 },
            { value: "React", count: 2 }
        ])
    })

    it("sem perfil vale a grafia do primeiro projeto na ordem do conteúdo", () => {
        const { technologies } = listProjectFilterOptions(
            [recordWith("2026-01", "node.js"), recordWith("2025-01", "Node.JS")],
            [],
            "pt-BR"
        )

        expect(technologies).toStrictEqual([{ value: "node.js", count: 2 }])
    })

    it("conta uma vez o projeto que repete a tecnologia na stack", () => {
        const record = buildProjectRecord({
            date: "2026-01",
            stack: [
                { category: "frontend", items: [{ name: "React" }] },
                { category: "backend", items: [{ name: "React" }, { name: "Node.js" }] }
            ]
        })

        expect(listProjectFilterOptions([record], [], "pt-BR").technologies).toStrictEqual([
            { value: "Node.js", count: 1 },
            { value: "React", count: 1 }
        ])
    })

    it("ordena as tecnologias pela colação do idioma, com Árvore entre as demais em pt-BR", () => {
        const { technologies } = listProjectFilterOptions(
            [recordWith("2026-01", "Zod", "Árvore", "Node.js", "Banco")],
            [],
            "pt-BR"
        )

        expect(technologies.map((option) => option.value)).toStrictEqual([
            "Árvore",
            "Banco",
            "Node.js",
            "Zod"
        ])
    })

    it("lista os anos do mais recente ao mais antigo, com count 0 nos anos do intervalo sem projeto", () => {
        const { years } = listProjectFilterOptions(
            [
                recordWith("2026-05", "React"),
                recordWith("2024-01", "React"),
                recordWith("2024-09", "React")
            ],
            [],
            "pt-BR"
        )

        expect(years).toStrictEqual([
            { value: "2026", count: 1 },
            { value: "2025", count: 0 },
            { value: "2024", count: 2 }
        ])
    })

    it("com um só ano gera um item", () => {
        expect(
            listProjectFilterOptions([recordWith("2025-03", "React")], [], "pt-BR").years
        ).toStrictEqual([{ value: "2025", count: 1 }])
    })

    it("conta os projetos reais do conteúdo sem depender de busca nem de filtro", () => {
        const records = [
            recordWith("2026-01", "React", "Node.js"),
            recordWith("2025-01", "React"),
            recordWith("2025-06", "Python")
        ]

        const result = listProjectFilterOptions(
            records,
            stackOf("React", "Node.js", "Docker"),
            "en"
        )

        expect(result.technologies).toStrictEqual([
            { value: "Docker", count: 0 },
            { value: "Node.js", count: 1 },
            { value: "Python", count: 1 },
            { value: "React", count: 2 }
        ])
        expect(result.years).toStrictEqual([
            { value: "2026", count: 1 },
            { value: "2025", count: 2 }
        ])
    })
})
