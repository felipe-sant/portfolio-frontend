import { afterEach, describe, expect, it, vi } from "vitest"
import readText from "@/services/content/readText"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("readText", () => {
    it("devolve o texto da resposta e pede o caminho publicado", async () => {
        const fetchMock = vi.fn().mockResolvedValue(new Response("conteúdo"))
        vi.stubGlobal("fetch", fetchMock)

        await expect(readText("content/shared/LICENSE")).resolves.toBe("conteúdo")
        expect(fetchMock).toHaveBeenCalledWith("/content/shared/LICENSE")
    })

    it("lança erro com o status e o caminho quando a resposta não é ok", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 404 })))

        await expect(readText("content/missing.md")).rejects.toThrow(
            "Falha ao carregar o arquivo content/missing.md: status 404"
        )
    })

    it("repassa a rejeição de rede", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))

        await expect(readText("content/a.md")).rejects.toThrow("Failed to fetch")
    })
})
