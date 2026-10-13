import { describe, expect, it } from "vitest"
import collectCertificates from "@/services/content/collectCertificates"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"
import type TimelineGroup from "@/types/timeline/TimelineGroup.types"

describe("collectCertificates", () => {
    it("devolve lista vazia sem certificados", () => {
        const groups: TimelineGroup[] = [{ kind: "experience", items: [] }]

        expect(collectCertificates(groups)).toEqual([])
    })

    it("mantém só a primeira ocorrência de cada id", () => {
        const first = { id: "0192f1c4-0000-7000-8000-000000000001", name: "A" }
        const second = { id: "0192f1c4-0000-7000-8000-000000000002", name: "B" }
        const { projectIds, ...base } = buildTimelineItemRecord()
        const groups: TimelineGroup[] = [
            {
                kind: "education",
                items: [
                    { ...base, projects: [], certificates: [first, second] },
                    { ...base, projects: [], certificates: [first] }
                ]
            }
        ]

        expect(projectIds).toEqual([])
        expect(collectCertificates(groups)).toEqual([first, second])
    })
})
