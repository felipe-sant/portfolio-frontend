import { afterEach, describe, expect, it, vi } from "vitest"
import ContentException from "@/services/content/ContentException"
import readJson from "@/services/content/readJson"
import itemsSchema from "@/testUtils/itemsSchema"
import type ContentSchema from "@/types/content/ContentSchema.types"

const loadItemsSchema = async () => itemsSchema

afterEach(() => {
    vi.unstubAllGlobals()
})

async function catchError(promise: Promise<unknown>): Promise<unknown> {
    try {
        await promise
    } catch (error) {
        return error
    }
    return undefined
}

describe("readJson", () => {
    it("lança INVALID_CONTENT quando o texto não é um JSON válido", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response("{inválido"))
        )

        const error = await catchError(readJson("content/pt-BR/broken.json", loadItemsSchema))

        expect(error).toBeInstanceOf(ContentException)
        expect(error).toMatchObject({
            contentError: {
                status: 500,
                data: { error: { code: "INVALID_CONTENT" } }
            },
            message: "O arquivo content/pt-BR/broken.json não é um JSON válido"
        })
    })

    it("rejeita a cada chamada quando o JSON é inválido", async () => {
        const fetchMock = vi.fn(async () => new Response("{inválido"))
        vi.stubGlobal("fetch", fetchMock)

        await expect(readJson("content/pt-BR/again.json", loadItemsSchema)).rejects.toThrow()
        await expect(readJson("content/pt-BR/again.json", loadItemsSchema)).rejects.toThrow()
    })

    it("mantém o Error comum quando a resposta é 404", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })))

        const error = await catchError(readJson("content/pt-BR/missing.json", loadItemsSchema))

        expect(error).toBeInstanceOf(Error)
        expect(error).not.toBeInstanceOf(ContentException)
        expect(error).toMatchObject({ message: expect.stringContaining("status 404") })
    })

    it("repassa a rejeição de rede", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))

        await expect(readJson("content/pt-BR/net.json", loadItemsSchema)).rejects.toThrow(
            "Failed to fetch"
        )
    })

    it("lança INVALID_CONTENT com arquivo, primeiro campo e fields quando foge do contrato", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response(JSON.stringify({ items: ["a", 2, 3] })))
        )

        const error = await catchError(readJson("content/pt-BR/items.json", loadItemsSchema))

        expect(error).toBeInstanceOf(ContentException)
        expect(error).toMatchObject({
            message: expect.stringMatching(
                /^O arquivo content\/pt-BR\/items\.json não segue o contrato: items\.1: /
            ),
            contentError: {
                status: 500,
                data: {
                    error: {
                        code: "INVALID_CONTENT",
                        fields: [
                            { field: "items.1", code: "invalid_type" },
                            { field: "items.2", code: "invalid_type" }
                        ]
                    }
                }
            }
        })
    })

    it("limita fields a dez problemas", async () => {
        const body = { items: Array.from({ length: 15 }, () => 1) }
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response(JSON.stringify(body)))
        )

        const error = await catchError(readJson("content/pt-BR/many.json", loadItemsSchema))

        expect(error).toBeInstanceOf(ContentException)
        if (error instanceof ContentException) {
            expect(error.contentError.data.error.fields).toHaveLength(10)
        }
    })

    it("devolve o dado validado sem mudança", async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({ items: ["a", "b"] })))
        vi.stubGlobal("fetch", fetchMock)

        await expect(readJson("content/pt-BR/ok.json", loadItemsSchema)).resolves.toEqual({
            items: ["a", "b"]
        })
        expect(fetchMock).toHaveBeenCalledWith("/content/pt-BR/ok.json")
    })

    it("descarta chave desconhecida quando o schema a remove", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response(JSON.stringify({ items: ["a"], extra: true })))
        )

        await expect(readJson("content/pt-BR/extra.json", loadItemsSchema)).resolves.toEqual({
            items: ["a"]
        })
    })

    it("começa a carregar o schema antes de o fetch terminar", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(() => new Promise<Response>(() => undefined))
        )
        const loadSchema = vi.fn(async (): Promise<ContentSchema<unknown>> => itemsSchema)

        void readJson("content/pt-BR/pending.json", loadSchema)

        expect(loadSchema).toHaveBeenCalledTimes(1)
    })

    it("não apaga o texto do cache quando a validação falha", async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({ items: [1] })))
        vi.stubGlobal("fetch", fetchMock)

        await expect(readJson("content/pt-BR/cached.json", loadItemsSchema)).rejects.toThrow()
        await expect(readJson("content/pt-BR/cached.json", loadItemsSchema)).rejects.toThrow()

        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("faz um fetch para duas leituras e devolve objetos iguais e independentes", async () => {
        const fetchMock = vi.fn(
            async () => new Response(JSON.stringify({ items: ["c", "a", "b"] }))
        )
        vi.stubGlobal("fetch", fetchMock)

        const first = await readJson("content/pt-BR/twice.json", loadItemsSchema)
        const second = await readJson("content/pt-BR/twice.json", loadItemsSchema)

        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(second).not.toBe(first)
        expect(second).toEqual({ items: ["c", "a", "b"] })
    })
})
