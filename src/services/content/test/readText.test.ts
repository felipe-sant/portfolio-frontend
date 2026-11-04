import { afterEach, describe, expect, it, vi } from "vitest"
import clearContentCache from "@/services/content/clearContentCache"
import readText from "@/services/content/readText"

function ignore() {}

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

    it("faz um só fetch para duas leituras seguidas do mesmo caminho", async () => {
        const fetchMock = vi.fn(async () => new Response("texto"))
        vi.stubGlobal("fetch", fetchMock)

        const first = await readText("content/pt-BR/projects.json")
        const second = await readText("content/pt-BR/projects.json")

        expect(first).toBe("texto")
        expect(second).toBe("texto")
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("compartilha o fetch de dois pedidos feitos antes de o primeiro resolver", async () => {
        let release = ignore
        const gate = new Promise<void>((resolve) => {
            release = resolve
        })
        const fetchMock = vi.fn(async () => {
            await gate
            return new Response("texto")
        })
        vi.stubGlobal("fetch", fetchMock)

        const first = readText("content/pt-BR/profile.json")
        const second = readText("content/pt-BR/profile.json")
        release()

        await expect(Promise.all([first, second])).resolves.toEqual(["texto", "texto"])
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("faz um fetch para cada caminho diferente", async () => {
        const fetchMock = vi.fn(async () => new Response("texto"))
        vi.stubGlobal("fetch", fetchMock)

        await readText("content/pt-BR/projects.json")
        await readText("content/en/projects.json")

        expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    it("não guarda a resposta não ok: a leitura seguinte pede de novo e resolve", async () => {
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("", { status: 500 })))
        await expect(readText("content/pt-BR/projects.json")).rejects.toThrow("status 500")

        const fetchMock = vi.fn(async () => new Response("ok"))
        vi.stubGlobal("fetch", fetchMock)

        await expect(readText("content/pt-BR/projects.json")).resolves.toBe("ok")
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("não guarda a rejeição de rede nem a falha do corpo", async () => {
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))
        await expect(readText("content/a.md")).rejects.toThrow("Failed to fetch")

        const brokenBody = { ok: true, text: () => Promise.reject(new Error("corpo")) }
        vi.stubGlobal("fetch", vi.fn().mockResolvedValue(brokenBody))
        await expect(readText("content/a.md")).rejects.toThrow("corpo")

        const fetchMock = vi.fn(async () => new Response("ok"))
        vi.stubGlobal("fetch", fetchMock)

        await expect(readText("content/a.md")).resolves.toBe("ok")
        expect(fetchMock).toHaveBeenCalledTimes(1)
    })

    it("entrega a rejeição original a dois chamadores pendentes sem rejeição não tratada", async () => {
        const unhandled = vi.fn()
        process.on("unhandledRejection", unhandled)
        vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")))

        const first = readText("content/b.md")
        const second = readText("content/b.md")

        await expect(first).rejects.toThrow("Failed to fetch")
        await expect(second).rejects.toThrow("Failed to fetch")
        await new Promise((resolve) => setTimeout(resolve, 0))
        process.off("unhandledRejection", unhandled)

        expect(unhandled).not.toHaveBeenCalled()
    })

    it("não apaga a entrada nova quando uma leitura antiga falha depois do reset", async () => {
        let failA = ignore
        let releaseB = ignore
        const gateA = new Promise<void>((_, reject) => {
            failA = () => reject(new Error("A falhou"))
        })
        const gateB = new Promise<void>((resolve) => {
            releaseB = resolve
        })
        const fetchA = vi.fn(async () => {
            await gateA
            return new Response("a")
        })
        const fetchB = vi.fn(async () => {
            await gateB
            return new Response("b")
        })

        vi.stubGlobal("fetch", fetchA)
        const requestA = readText("content/c.md")
        const handledA = requestA.catch(() => undefined)

        clearContentCache()
        vi.stubGlobal("fetch", fetchB)
        const requestB = readText("content/c.md")

        failA()
        await handledA

        const fetchC = vi.fn(async () => new Response("c"))
        vi.stubGlobal("fetch", fetchC)
        const requestC = readText("content/c.md")
        releaseB()

        await expect(requestC).resolves.toBe("b")
        await expect(requestB).resolves.toBe("b")
        expect(fetchB).toHaveBeenCalledTimes(1)
        expect(fetchC).not.toHaveBeenCalled()
    })

    it("começa cada teste com a memória vazia (primeiro)", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response("primeiro"))
        )

        await expect(readText("content/isolation.md")).resolves.toBe("primeiro")
    })

    it("começa cada teste com a memória vazia (segundo)", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn(async () => new Response("segundo"))
        )

        await expect(readText("content/isolation.md")).resolves.toBe("segundo")
    })
})
