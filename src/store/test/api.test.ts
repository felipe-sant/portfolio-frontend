import { configureStore } from "@reduxjs/toolkit"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

function jsonResponse(body: unknown) {
    return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" }
    })
}

async function setup() {
    vi.stubEnv("VITE_API_URL", "https://api.example.com")
    vi.resetModules()
    const { default: api } = await import("@/store/api")
    const { default: setLanguage } = await import("@/i18n/setLanguage")
    await setLanguage("pt-BR")
    const fetchMock = vi.fn().mockImplementation(async () => jsonResponse({ id: "1" }))
    vi.stubGlobal("fetch", fetchMock)

    const itemsApi = api.injectEndpoints({
        endpoints: (build) => ({
            getItem: build.query<{ id: string }, void>({ query: () => "/items/1" })
        })
    })
    const store = configureStore({
        reducer: { [api.reducerPath]: api.reducer },
        middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware)
    })

    return { itemsApi, store, fetchMock, setLanguage }
}

function requestOf(fetchMock: ReturnType<typeof vi.fn>): Request {
    return fetchMock.mock.calls[0][0] as Request
}

beforeEach(() => {
    vi.resetModules()
})

afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
})

describe("api", () => {
    it("começa sem endpoints e com o reducerPath api", async () => {
        vi.resetModules()
        const { default: api } = await import("@/store/api")

        expect(api.reducerPath).toBe("api")
        expect(Object.keys(api.endpoints)).toHaveLength(0)
    })

    it("devolve o dado do endpoint injetado e usa a URL base", async () => {
        const { itemsApi, store, fetchMock } = await setup()

        const result = await store.dispatch(itemsApi.endpoints.getItem.initiate())

        expect(result.data).toEqual({ id: "1" })
        expect(requestOf(fetchMock).url).toBe("https://api.example.com/items/1")
    })

    it("envia Accept-Language com o idioma ativo", async () => {
        const { itemsApi, store, fetchMock } = await setup()

        await store.dispatch(itemsApi.endpoints.getItem.initiate())

        expect(requestOf(fetchMock).headers.get("Accept-Language")).toBe("pt-BR")
    })

    it("envia o novo Accept-Language depois que o idioma muda", async () => {
        const { itemsApi, store, fetchMock, setLanguage } = await setup()

        await setLanguage("en")
        await store.dispatch(itemsApi.endpoints.getItem.initiate())

        expect(requestOf(fetchMock).headers.get("Accept-Language")).toBe("en")
    })
})
