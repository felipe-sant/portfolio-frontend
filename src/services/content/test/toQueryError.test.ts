import { describe, expect, it } from "vitest"
import ContentException from "@/services/content/ContentException"
import createContentError from "@/services/content/createContentError"
import toQueryError from "@/services/content/toQueryError"

describe("toQueryError", () => {
    it("devolve o erro de contrato quando a exceção é de contrato", () => {
        const contentError = createContentError(404, "NOT_FOUND", "Projeto não encontrado.")

        expect(toQueryError(new ContentException(contentError))).toBe(contentError)
    })

    it("devolve FETCH_ERROR com a mensagem quando a carga falha", () => {
        expect(toQueryError(new Error("Falha ao carregar o arquivo a.json: status 404"))).toEqual({
            status: "FETCH_ERROR",
            error: "Falha ao carregar o arquivo a.json: status 404"
        })
    })

    it("devolve FETCH_ERROR para valor que não é Error", () => {
        expect(toQueryError("quebrou")).toEqual({ status: "FETCH_ERROR", error: "quebrou" })
    })
})
