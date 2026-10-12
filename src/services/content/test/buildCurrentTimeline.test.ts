import { describe, expect, it } from "vitest"
import buildCurrentTimeline from "@/services/content/buildCurrentTimeline"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"

function item(index: number, overrides: Parameters<typeof buildTimelineItemRecord>[0] = {}) {
    return buildTimelineItemRecord({
        id: `0192f1b2-0000-7000-8000-0000000000${String(index).padStart(2, "0")}`,
        title: `Item ${index}`,
        ...overrides
    })
}

function titles(records: ReturnType<typeof item>[]) {
    return buildCurrentTimeline(records, []).items.map((entry) => entry.title)
}

describe("buildCurrentTimeline", () => {
    it("devolve lista vazia quando nada está em curso", () => {
        expect(titles([item(1, { end: "2022-01" })])).toEqual([])
    })

    it("devolve só a experiência quando não há formação nem curso em curso", () => {
        expect(titles([item(1), item(2, { kind: "education", end: "2022-01" })])).toEqual([
            "Item 1"
        ])
    })

    it("devolve a experiência e a formação ou curso mais recente em curso", () => {
        const records = [
            item(1, { start: "2022-01" }),
            item(2, { start: "2024-01" }),
            item(3, { kind: "education", start: "2023-02" }),
            item(4, { kind: "course", start: "2025-03", organization: undefined }),
            item(5, { kind: "course", start: "2021-03", end: "2021-06" })
        ]

        expect(titles(records)).toEqual(["Item 2", "Item 4"])
    })

    it("devolve só a formação quando não há experiência em curso", () => {
        expect(titles([item(1, { kind: "education" })])).toEqual(["Item 1"])
    })

    it("desempata o início igual pela ordem do conteúdo", () => {
        const records = [
            item(1, { start: "2024-01" }),
            item(2, { start: "2024-01" }),
            item(3, { kind: "course", start: "2024-01" }),
            item(4, { kind: "education", start: "2024-01" })
        ]

        expect(titles(records)).toEqual(["Item 1", "Item 3"])
    })

    it("traz projects com o título e sem projectIds", () => {
        const entry = buildCurrentTimeline(
            [item(1, { projectIds: ["0192f1a0-0000-7000-8000-000000000099"] })],
            []
        ).items[0]

        expect(entry.projects).toEqual([])
        expect("projectIds" in entry).toBe(false)
    })
})
