import { describe, expect, it } from "vitest"
import ContentException from "@/services/content/ContentException"
import createContentError from "@/services/content/createContentError"
import runQueryFn from "@/utils/runQueryFn"

describe("runQueryFn", () => {
    it("devolve o erro de contrato quando a função lança uma exceção de contrato", async () => {
        const contentError = createContentError(404, "NOT_FOUND", "Projeto não encontrado.")

        const result = await runQueryFn(async () => {
            throw new ContentException(contentError)
        })

        expect(result).toEqual({ error: contentError })
    })

    it("devolve FETCH_ERROR com a mensagem quando a função lança um Error", async () => {
        const result = await runQueryFn(async () => {
            throw new Error("Falha ao carregar o arquivo a.json: status 404")
        })

        expect(result).toEqual({
            error: {
                status: "FETCH_ERROR",
                error: "Falha ao carregar o arquivo a.json: status 404"
            }
        })
    })

    it("devolve FETCH_ERROR com o texto do valor quando a função lança algo que não é Error", async () => {
        const result = await runQueryFn(async () => {
            throw "quebrou"
        })

        expect(result).toEqual({ error: { status: "FETCH_ERROR", error: "quebrou" } })
    })

    it("devolve o dado quando a função resolve", async () => {
        const result = await runQueryFn(async () => ({ name: "Portfólio" }))

        expect(result).toEqual({ data: { name: "Portfólio" } })
    })

    it("devolve data indefinido quando a função resolve sem valor", async () => {
        const result = await runQueryFn(async () => undefined)

        expect(result).toEqual({ data: undefined })
    })
})
