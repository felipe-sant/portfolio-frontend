import { describe, expect, it } from "vitest"
import buildTimeline from "@/services/content/buildTimeline"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"

function item(index: number, overrides: Parameters<typeof buildTimelineItemRecord>[0] = {}) {
    return buildTimelineItemRecord({
        id: `0192f1b2-0000-7000-8000-0000000000${String(index).padStart(2, "0")}`,
        title: `Item ${index}`,
        ...overrides
    })
}

describe("buildTimeline", () => {
    it("devolve sempre três grupos, com items vazio quando não há item", () => {
        const timeline = buildTimeline([item(1)], [])

        expect(timeline.groups.map((group) => group.kind)).toEqual([
            "experience",
            "education",
            "course"
        ])
        expect(timeline.groups[1].items).toEqual([])
        expect(timeline.groups[2].items).toEqual([])
    })

    it("ordena em curso primeiro, depois por fim e início mais recentes", () => {
        const records = [
            item(1, { start: "2019-01", end: "2020-01" }),
            item(2, { start: "2021-01", end: "2022-06" }),
            item(3, { start: "2018-05" }),
            item(4, { start: "2020-03", end: "2022-06" }),
            item(5, { start: "2023-02" })
        ]

        const [group] = buildTimeline(records, []).groups

        expect(group.items.map((entry) => entry.title)).toEqual([
            "Item 5",
            "Item 3",
            "Item 2",
            "Item 4",
            "Item 1"
        ])
    })

    it("mantém a ordem do conteúdo no empate total", () => {
        const [group] = buildTimeline([item(2), item(1), item(3)], []).groups

        expect(group.items.map((entry) => entry.title)).toEqual(["Item 2", "Item 1", "Item 3"])
    })

    it("não repete certificado e percorre grupos, itens e certificados na ordem final", () => {
        const shared = {
            id: "0192f1c4-0000-7000-8000-000000000001",
            name: "Técnico",
            issuer: "Escola"
        }
        const other = { id: "0192f1c4-0000-7000-8000-000000000002", name: "Curso React" }
        const records = [
            item(1, { kind: "course", organization: undefined, certificates: [other, shared] }),
            item(2, { kind: "education", certificates: [shared] }),
            item(3, { kind: "education", start: "2025-01", certificates: [shared] })
        ]

        const { certificates } = buildTimeline(records, [])

        expect(certificates.map((certificate) => certificate.id)).toEqual([shared.id, other.id])
    })

    it("troca projectIds por projects com o título do projeto, na mesma ordem", () => {
        const first = buildProjectRecord({
            id: "0192f1a0-0000-7000-8000-000000000001",
            title: "Maps"
        })
        const second = buildProjectRecord({
            id: "0192f1a0-0000-7000-8000-000000000002",
            title: "Mapas"
        })
        const records = [item(1, { projectIds: [second.id, first.id] })]

        const [entry] = buildTimeline(records, [first, second]).groups[0].items

        expect(entry.projects).toEqual([
            { id: second.id, title: "Mapas" },
            { id: first.id, title: "Maps" }
        ])
        expect("projectIds" in entry).toBe(false)
    })
})
