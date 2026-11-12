import { describe, expect, it } from "vitest"
import listResponse from "@/services/content/schemas/listResponse.schema"
import projectRecordSchema from "@/services/content/schemas/projectRecord.schema"
import buildProjectRecord from "@/testUtils/buildProjectRecord"

describe("listResponse", () => {
    it("rejeita quando items está ausente", () => {
        const result = listResponse(projectRecordSchema).safeParse({})

        expect(result.success).toBe(false)
        expect(result.error?.issues[0]?.path).toEqual(["items"])
    })

    it("aceita items vazio", () => {
        const result = listResponse(projectRecordSchema).safeParse({ items: [] })

        expect(result.success).toBe(true)
        expect(result.data).toEqual({ items: [] })
    })

    it("valida cada item da lista", () => {
        const result = listResponse(projectRecordSchema).safeParse({
            items: [buildProjectRecord(), { ...buildProjectRecord(), status: "x" }]
        })

        expect(result.success).toBe(false)
        expect(result.error?.issues[0]?.path).toEqual(["items", 1, "status"])
    })
})
