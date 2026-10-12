import { describe, expect, it } from "vitest"
import ContentException from "@/services/content/ContentException"
import findProjectDocument from "@/services/content/findProjectDocument"
import buildProjectRecord from "@/testUtils/buildProjectRecord"

describe("findProjectDocument", () => {
    it("devolve o documento com o id pedido", () => {
        const record = buildProjectRecord()

        expect(findProjectDocument(record, record.documents[0].id)).toBe(record.documents[0])
    })

    it("lança 404 NOT_FOUND quando o documento não está no projeto", () => {
        try {
            findProjectDocument(buildProjectRecord(), "0192f1d0-0000-7000-8000-000000000001")
            expect.unreachable()
        } catch (error) {
            expect(error).toBeInstanceOf(ContentException)
            expect(error instanceof ContentException && error.contentError.data.error.code).toBe(
                "NOT_FOUND"
            )
        }
    })
})
