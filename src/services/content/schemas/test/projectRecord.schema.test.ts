import { describe, expect, it } from "vitest"
import projectRecordSchema from "@/services/content/schemas/projectRecord.schema"
import buildProjectRecord from "@/testUtils/buildProjectRecord"

function firstPath(value: unknown): unknown {
    return projectRecordSchema.safeParse(value).error?.issues[0]?.path
}

describe("projectRecordSchema", () => {
    it("rejeita types vazio", () => {
        expect(firstPath({ ...buildProjectRecord(), types: [] })).toEqual(["types"])
    })

    it("rejeita type fora de PROJECT_TYPES", () => {
        expect(firstPath({ ...buildProjectRecord(), types: ["toaster"] })).toEqual(["types", 0])
    })

    it("rejeita category fora do enum", () => {
        expect(firstPath({ ...buildProjectRecord(), category: "hobby" })).toEqual(["category"])
    })

    it("rejeita status fora do enum", () => {
        expect(firstPath({ ...buildProjectRecord(), status: "paused" })).toEqual(["status"])
    })

    it("rejeita format de documento fora de DOCUMENT_FORMATS", () => {
        const record = {
            ...buildProjectRecord(),
            documents: [{ id: "x", name: "a.pdf", format: "pdf", translated: true }]
        }

        expect(firstPath(record)).toEqual(["documents", 0, "format"])
    })

    it("rejeita featured que não é booleano", () => {
        expect(firstPath({ ...buildProjectRecord(), featured: "yes" })).toEqual(["featured"])
    })

    it("rejeita data fora de AAAA-MM", () => {
        expect(firstPath({ ...buildProjectRecord(), date: "2026-13" })).toEqual(["date"])
    })

    it("rejeita campo obrigatório ausente", () => {
        const withoutTitle = Object.fromEntries(
            Object.entries(buildProjectRecord()).filter(([key]) => key !== "title")
        )

        expect(firstPath(withoutTitle)).toEqual(["title"])
    })

    it("aceita a fixture válida e devolve dado igual a ela", () => {
        const record = buildProjectRecord()

        const result = projectRecordSchema.safeParse(record)

        expect(result.success).toBe(true)
        expect(result.data).toEqual(record)
    })

    it("aceita chave desconhecida e a remove do resultado", () => {
        const result = projectRecordSchema.safeParse({ ...buildProjectRecord(), extra: 1 })

        expect(result.success).toBe(true)
        expect(result.data).toEqual(buildProjectRecord())
    })
})
