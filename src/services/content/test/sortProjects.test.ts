import { describe, expect, it } from "vitest"
import sortProjects from "@/services/content/sortProjects"
import buildProjectRecord from "@/testUtils/buildProjectRecord"

const alpha = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-00000000000a",
    title: "Alfa",
    date: "2026-03"
})
const bravo = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-00000000000b",
    title: "bravo",
    date: "2026-03"
})
const accent = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-00000000000c",
    title: "Álvaro",
    date: "2025-01"
})
const old = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-00000000000d",
    title: "Zeta 2",
    date: "2024-12"
})
const oldBig = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-00000000000e",
    title: "Zeta 10",
    date: "2024-12"
})
const twin = buildProjectRecord({
    id: "0192f1a0-0000-7000-8000-00000000000f",
    title: "Alfa",
    date: "2026-03"
})

function ids(
    sort: "recent" | "oldest" | "title",
    list = [old, bravo, twin, accent, alpha, oldBig]
) {
    return sortProjects(list, sort, "pt-BR").map((project) => project.id.slice(-1))
}

describe("sortProjects", () => {
    it("ordena do mais recente, desempatando por título e depois por id", () => {
        expect(ids("recent")).toEqual(["a", "f", "b", "c", "d", "e"])
    })

    it("ordena do mais antigo, desempatando por título e depois por id", () => {
        expect(ids("oldest")).toEqual(["d", "e", "c", "a", "f", "b"])
    })

    it("ordena por título A-Z com acento e número, desempatando por data e id", () => {
        expect(ids("title")).toEqual(["a", "f", "c", "b", "d", "e"])
    })

    it("não altera a lista original", () => {
        const list = [bravo, alpha]

        sortProjects(list, "title", "pt-BR")

        expect(list).toEqual([bravo, alpha])
    })
})
