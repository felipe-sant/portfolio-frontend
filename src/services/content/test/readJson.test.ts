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

    it("faz um fetch para duas leituras e devolve objetos iguais e independentes", async () => {
        const fetchMock = vi.fn(async () => new Response(JSON.stringify({ items: [3, 1, 2] })))
        vi.stubGlobal("fetch", fetchMock)

        const first = await readJson<{ items: number[] }>("content/pt-BR/projects.json")
        const second = await readJson<{ items: number[] }>("content/pt-BR/projects.json")
        first.items.sort()
        first.items.push(9)

        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(second).not.toBe(first)
        expect(second).toEqual({ items: [3, 1, 2] })
    })

    it("rejeita a cada chamada quando o JSON é inválido", async () => {
        const fetchMock = vi.fn(async () => new Response("{inválido"))
        vi.stubGlobal("fetch", fetchMock)

        await expect(readJson("content/pt-BR/broken.json")).rejects.toThrow()
        await expect(readJson("content/pt-BR/broken.json")).rejects.toThrow()
    })
})
