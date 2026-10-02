import { afterEach, describe, expect, it, vi } from "vitest"
import setLanguage from "@/i18n/setLanguage"
import get from "@/services/http/get"

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

describe("get", () => {
    it("devolve o corpo da resposta em JSON", async () => {
        mockFetch({ ok: true, json: async () => ({ id: "1" }) })

        await expect(get<{ id: string }>("/api/example")).resolves.toEqual({ id: "1" })
    })

    it("envia o método GET, aceita JSON e informa o idioma ativo", async () => {
        const fetchMock = mockFetch({ ok: true, json: async () => ({}) })

        await get("/api/example")

        expect(fetchMock).toHaveBeenCalledWith("/api/example", {
            method: "GET",
            headers: { Accept: "application/json", "Accept-Language": "pt-BR" }
        })
    })

    it("envia o novo Accept-Language depois que o idioma muda", async () => {
        const fetchMock = mockFetch({ ok: true, json: async () => ({}) })

        await setLanguage("en")
        await get("/api/example")

        expect(fetchMock.mock.calls[0][1].headers["Accept-Language"]).toBe("en")
    })

    it("prefixa o caminho com a URL base da API", async () => {
        vi.stubEnv("VITE_API_URL", "https://api.example.com")
        vi.resetModules()
        const { default: freshGet } = await import("@/services/http/get")
        const fetchMock = mockFetch({ ok: true, json: async () => ({}) })

        await freshGet("/items")

        expect(fetchMock.mock.calls[0][0]).toBe("https://api.example.com/items")
    })

    it("repassa o AbortSignal ao fetch", async () => {
        const fetchMock = mockFetch({ ok: true, json: async () => ({}) })
        const controller = new AbortController()

        await get("/api/example", { signal: controller.signal })

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

        const request = get("/api/example", { signal: controller.signal })
        controller.abort()

        await expect(request).rejects.toMatchObject({ name: "AbortError" })
    })

    it("lança um erro com o status quando a resposta não é ok", async () => {
        mockFetch({ ok: false, status: 404, text: async () => "", json: async () => ({}) })

        await expect(get("/api/example")).rejects.toThrow("Requisição falhou com status 404.")
    })

    it("inclui o corpo do erro na mensagem", async () => {
        mockFetch({ ok: false, status: 400, text: async () => "Dados inválidos" })

        await expect(get("/api/example")).rejects.toThrow(
            "Requisição falhou com status 400: Dados inválidos"
        )
    })
})
