import { afterEach, describe, expect, it, vi } from "vitest"
import ContentException from "@/services/content/ContentException"
import loadProjectRecords from "@/services/content/loadProjectRecords"
import buildProjectRecord from "@/testUtils/buildProjectRecord"
import stubContentFetch from "@/testUtils/stubContentFetch"

afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe("loadProjectRecords", () => {
    it("lê os projetos do idioma pedido", async () => {
        const records = [buildProjectRecord()]
        const fetchMock = stubContentFetch({ "content/pt-BR/projects.json": { items: records } })

        await expect(loadProjectRecords("pt-BR")).resolves.toEqual(records)
        expect(fetchMock).toHaveBeenCalledWith("/content/pt-BR/projects.json")
    })

    it("pede o arquivo com o prefixo do GitHub Pages", async () => {
        vi.stubEnv("BASE_URL", "/ra2581392423047/")
        vi.resetModules()
        const { default: freshLoad } = await import("@/services/content/loadProjectRecords")
        const fetchMock = stubContentFetch({ "content/en/projects.json": { items: [] } })

        await expect(freshLoad("en")).resolves.toEqual([])
        expect(fetchMock).toHaveBeenCalledWith("/ra2581392423047/content/en/projects.json")
    })
})

describe("loadProjectRecords com conteúdo fora do contrato", () => {
    it("lança INVALID_CONTENT apontando o campo inválido", async () => {
        const record = { ...buildProjectRecord(), types: [] }
        stubContentFetch({ "content/pt-BR/projects.json": { items: [record] } })

        const error = await loadProjectRecords("pt-BR").catch((caught: unknown) => caught)

        expect(error).toBeInstanceOf(ContentException)
        expect(error).toMatchObject({
            message: expect.stringContaining(
                "O arquivo content/pt-BR/projects.json não segue o contrato: items.0.types"
            ),
            contentError: {
                status: 500,
                data: { error: { code: "INVALID_CONTENT", fields: [{ field: "items.0.types" }] } }
            }
        })
    })
})
