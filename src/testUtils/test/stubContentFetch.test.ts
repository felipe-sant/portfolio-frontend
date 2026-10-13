import { afterEach, describe, expect, it, vi } from "vitest"
import stubContentFetch from "@/testUtils/stubContentFetch"

afterEach(() => {
    vi.unstubAllGlobals()
    vi.unstubAllEnvs()
})

describe("stubContentFetch", () => {
    it("responde JSON para objeto e texto para string", async () => {
        stubContentFetch({
            "content/pt-BR/projects.json": { items: [] },
            "content/shared/LICENSE": "MIT"
        })

        const json = await fetch("/content/pt-BR/projects.json")
        const text = await fetch("/content/shared/LICENSE")

        await expect(json.json()).resolves.toEqual({ items: [] })
        await expect(text.text()).resolves.toBe("MIT")
    })

    it("responde 404 para o que não está no mapa", async () => {
        stubContentFetch({})

        const response = await fetch("/content/pt-BR/profile.json")

        expect(response.status).toBe(404)
    })

    it("desconta o BASE_URL do pedido e devolve o fetchMock com a URL chamada", async () => {
        vi.stubEnv("BASE_URL", "/ra2581392423047/")
        const fetchMock = stubContentFetch({ "content/en/profile.json": { role: "Dev" } })

        const response = await fetch("/ra2581392423047/content/en/profile.json")

        expect(response.status).toBe(200)
        expect(fetchMock).toHaveBeenCalledWith("/ra2581392423047/content/en/profile.json")
    })
})
