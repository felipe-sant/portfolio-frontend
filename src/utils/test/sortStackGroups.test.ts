import { describe, expect, it } from "vitest"
import parseUntyped from "@/testUtils/parseUntyped"
import type StackGroup from "@/types/content/StackGroup.types"
import sortStackGroups from "@/utils/sortStackGroups"

function group(category: StackGroup["category"], ...names: string[]): StackGroup {
    return { category, items: names.map((name) => ({ name })) }
}

describe("sortStackGroups", () => {
    it("devolve vazio para lista vazia", () => {
        expect(sortStackGroups([])).toEqual([])
    })

    it("descarta o grupo sem itens", () => {
        expect(sortStackGroups([group("frontend"), group("backend", "Node.js")])).toEqual([
            group("backend", "Node.js")
        ])
    })

    it("ordena por frontend, backend e tooling", () => {
        const sorted = sortStackGroups([
            group("tooling", "Docker"),
            group("frontend", "React"),
            group("backend", "Node.js")
        ])

        expect(sorted.map((item) => item.category)).toEqual(["frontend", "backend", "tooling"])
    })

    it("descarta a categoria desconhecida e mantém a ordem dos itens", () => {
        const unknown: StackGroup = parseUntyped(
            JSON.stringify({ category: "mobile", items: [{ name: "Swift" }] })
        )
        const sorted = sortStackGroups([unknown, group("frontend", "TypeScript", "React", "CSS")])

        expect(sorted).toHaveLength(1)
        expect(sorted[0]?.items.map((item) => item.name)).toEqual(["TypeScript", "React", "CSS"])
    })
})
