import { describe, expect, it } from "vitest"
import timelineItemRecordSchema from "@/services/content/schemas/timelineItemRecord.schema"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"

function firstPath(value: unknown): unknown {
    return timelineItemRecordSchema.safeParse(value).error?.issues[0]?.path
}

describe("timelineItemRecordSchema", () => {
    it("rejeita kind fora de TIMELINE_KINDS", () => {
        expect(firstPath({ ...buildTimelineItemRecord(), kind: "hobby" })).toEqual(["kind"])
    })

    it("rejeita start fora de AAAA-MM", () => {
        expect(firstPath({ ...buildTimelineItemRecord(), start: "06/2024" })).toEqual(["start"])
    })

    it("rejeita projectIds que não é lista", () => {
        expect(firstPath({ ...buildTimelineItemRecord(), projectIds: "a" })).toEqual(["projectIds"])
    })

    it("aceita a fixture válida e devolve dado igual a ela", () => {
        const record = buildTimelineItemRecord()

        const result = timelineItemRecordSchema.safeParse(record)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(record)
    })

    it("aceita campos opcionais", () => {
        const record = buildTimelineItemRecord({
            end: "2025-01",
            stage: "Em andamento",
            certificates: [{ id: "c1", name: "Curso", issuer: "Escola" }]
        })

        expect(timelineItemRecordSchema.safeParse(record).data).toEqual(record)
    })
})
