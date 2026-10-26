import { afterEach, describe, expect, it, vi } from "vitest"
import clearContentCache from "@/services/content/clearContentCache"
import readText from "@/services/content/readText"

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("clearContentCache", () => {
    it("faz a leitura seguinte do mesmo caminho pedir de novo", async () => {
        const fetchMock = vi.fn(async () => new Response("texto"))
        vi.stubGlobal("fetch", fetchMock)

        await readText("content/pt-BR/projects.json")
        clearContentCache()
        await readText("content/pt-BR/projects.json")

        expect(fetchMock).toHaveBeenCalledTimes(2)
    })
})
