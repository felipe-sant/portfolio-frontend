import { afterEach, describe, expect, it, vi } from "vitest"
import setLanguage from "@/i18n/setLanguage"
import post from "@/services/http/post"

function mockFetch(response: Partial<Response>) {
    const fetchMock = vi.fn().mockResolvedValue(response as Response)
    vi.stubGlobal("fetch", fetchMock)
    return fetchMock
}

afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe("post", () => {
    it("serializa o corpo enviado, informa o Content-Type e o idioma ativo", async () => {
        const fetchMock = mockFetch({ ok: true, json: async () => ({ id: "1" }) })

        await post("/api/example", { name: "Exemplo" })

        expect(fetchMock).toHaveBeenCalledWith("/api/example", {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Accept-Language": "pt-BR",
                "Content-Type": "application/json"
            },
            body: '{"name":"Exemplo"}'
        })
    })

    it("envia o novo Accept-Language depois que o idioma muda", async () => {
        const fetchMock = mockFetch({ ok: true, json: async () => ({}) })

        await setLanguage("es")
        await post("/api/example", {})

        expect(fetchMock.mock.calls[0][1].headers["Accept-Language"]).toBe("es")
    })

    it("prefixa o caminho com a URL base da API", async () => {
        vi.stubEnv("VITE_API_URL", "https://api.example.com")
        vi.resetModules()
        const { default: freshPost } = await import("@/services/http/post")
        const fetchMock = mockFetch({ ok: true, json: async () => ({}) })

        await freshPost("/items", {})

        expect(fetchMock.mock.calls[0][0]).toBe("https://api.example.com/items")
    })

    it("repassa o AbortSignal ao fetch", async () => {
        const fetchMock = mockFetch({ ok: true, json: async () => ({}) })
        const controller = new AbortController()

        await post("/api/example", {}, { signal: controller.signal })

        expect(fetchMock.mock.calls[0][1].signal).toBe(controller.signal)
    })

    it("rejeita com AbortError quando a requisição é cancelada", async () => {
        const controller = new AbortController()
        vi.stubGlobal(
            "fetch",
            vi.fn((_url: string, init: RequestInit) => {
                return new Promise((_resolve, reject) => {
                    init.signal?.addEventListener("abort", () => reject(init.signal?.reason))
                })
            })
        )

        const request = post("/api/example", {}, { signal: controller.signal })
        controller.abort()

        await expect(request).rejects.toMatchObject({ name: "AbortError" })
    })

    it("lança um erro com o status quando a resposta não é ok", async () => {
        mockFetch({ ok: false, status: 500, text: async () => "" })

        await expect(post("/api/example", {})).rejects.toThrow("Requisição falhou com status 500.")
    })

    it("inclui o corpo do erro na mensagem", async () => {
        mockFetch({ ok: false, status: 422, text: async () => "Nome inválido" })

        await expect(post("/api/example", {})).rejects.toThrow(
            "Requisição falhou com status 422: Nome inválido"
        )
    })
})
