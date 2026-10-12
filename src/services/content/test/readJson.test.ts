import { afterEach, describe, expect, it, vi } from "vitest"
import readJson from "@/services/content/readJson"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("readJson", () => {
    it("interpreta o JSON da resposta", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ items: [1] })))
        vi.stubGlobal("fetch", fetchMock)

        await expect(readJson<{ items: number[] }>("content/pt-BR/projects.json")).resolves.toEqual(
            { items: [1] }
        )
        expect(fetchMock).toHaveBeenCalledWith("/content/pt-BR/projects.json")
    })

    it("lança erro quando a resposta é 404", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })))

        await expect(readJson("content/pt-BR/projects.json")).rejects.toThrow("status 404")
    })

    it("repassa a rejeição de rede", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))

        await expect(readJson("content/pt-BR/projects.json")).rejects.toThrow("Failed to fetch")
    })
})
