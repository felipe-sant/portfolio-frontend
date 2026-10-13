import { describe, expect, it } from "vitest"
import createContentError from "@/services/content/createContentError"

describe("createContentError", () => {
    it("monta o erro 400 com fields", () => {
        const error = createContentError(400, "INVALID_PARAMETER", "Parâmetro inválido.", [
            { field: "sort", code: "INVALID_VALUE", message: "Use recent, oldest ou title." }
        ])

        expect(error).toEqual({
            status: 400,
            data: {
                error: {
                    code: "INVALID_PARAMETER",
                    message: "Parâmetro inválido.",
                    fields: [
                        {
                            field: "sort",
                            code: "INVALID_VALUE",
                            message: "Use recent, oldest ou title."
                        }
                    ]
                }
            }
        })
    })

    it("monta o erro 404 sem o campo fields", () => {
        const error = createContentError(404, "NOT_FOUND", "Projeto não encontrado.")

        expect(error).toEqual({
            status: 404,
            data: { error: { code: "NOT_FOUND", message: "Projeto não encontrado." } }
        })
        expect("fields" in error.data.error).toBe(false)
    })
})
