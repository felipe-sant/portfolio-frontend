import { describe, expect, it } from "vitest"
import parseResponse from "@/services/http/parseResponse"

describe("parseResponse", () => {
    it("devolve o corpo em JSON quando a resposta é ok", async () => {
        const response = new Response(JSON.stringify({ id: "1" }), { status: 200 })

        await expect(parseResponse<{ id: string }>(response)).resolves.toEqual({ id: "1" })
    })

    it("inclui o corpo na mensagem quando a resposta não é ok e há corpo", async () => {
        const response = new Response("Nome inválido", { status: 422 })

        await expect(parseResponse(response)).rejects.toThrow(
            "Requisição falhou com status 422: Nome inválido"
        )
    })

    it("usa só o status quando a resposta não é ok e não há corpo", async () => {
        const response = new Response("", { status: 500 })

        await expect(parseResponse(response)).rejects.toThrow("Requisição falhou com status 500.")
    })

    it("não esconde o erro original quando a leitura do corpo falha", async () => {
        const response = {
            ok: false,
            status: 502,
            text: async () => {
                throw new Error("corpo ilegível")
            }
        } as unknown as Response

        await expect(parseResponse(response)).rejects.toThrow("Requisição falhou com status 502.")
    })
})
