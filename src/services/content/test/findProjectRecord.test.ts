import { describe, expect, it } from "vitest"
import ContentException from "@/services/content/ContentException"
import findProjectRecord from "@/services/content/findProjectRecord"
import buildProjectRecord from "@/testUtils/buildProjectRecord"

describe("findProjectRecord", () => {
    it("devolve o projeto com o id pedido", () => {
        const record = buildProjectRecord()

        expect(findProjectRecord([record], record.id)).toBe(record)
    })

    it("lança 404 NOT_FOUND quando o projeto não existe", () => {
        try {
            findProjectRecord([], "0192f1a0-0000-7000-8000-000000000001")
            expect.unreachable()
        } catch (error) {
            expect(error).toBeInstanceOf(ContentException)
            expect(error instanceof ContentException && error.contentError.status).toBe(404)
        }
    })
})
