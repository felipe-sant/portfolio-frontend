import { afterEach, describe, expect, it, vi } from "vitest"
import ContentException from "@/services/content/ContentException"
import loadTimelineRecords from "@/services/content/loadTimelineRecords"
import buildTimelineItemRecord from "@/testUtils/buildTimelineItemRecord"
import stubContentFetch from "@/testUtils/stubContentFetch"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("loadTimelineRecords", () => {
    it("lê os itens de trajetória do idioma pedido", async () => {
        const records = [buildTimelineItemRecord()]
        const fetchMock = stubContentFetch({ "content/es/timeline.json": { items: records } })

        await expect(loadTimelineRecords("es")).resolves.toEqual(records)
        expect(fetchMock).toHaveBeenCalledWith("/content/es/timeline.json")
    })
})

describe("loadTimelineRecords com conteúdo fora do contrato", () => {
    it("lança INVALID_CONTENT apontando o campo inválido", async () => {
        const record = { ...buildTimelineItemRecord(), start: "junho de 2024" }
        stubContentFetch({ "content/pt-BR/timeline.json": { items: [record] } })

        const error = await loadTimelineRecords("pt-BR").catch((caught: unknown) => caught)

        expect(error).toBeInstanceOf(ContentException)
        expect(error).toMatchObject({
            message: expect.stringContaining(
                "O arquivo content/pt-BR/timeline.json não segue o contrato: items.0.start"
            ),
            contentError: {
                status: 500,
                data: { error: { code: "INVALID_CONTENT", fields: [{ field: "items.0.start" }] } }
            }
        })
    })
})
