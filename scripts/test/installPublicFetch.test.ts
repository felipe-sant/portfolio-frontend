import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import readText from "@/services/content/readText"
import installPublicFetch from "@scripts/prerender/installPublicFetch"

const originalFetch = globalThis.fetch

afterEach(() => {
    globalThis.fetch = originalFetch
})

describe("installPublicFetch", () => {
    it("atende a URL sob o base lendo o arquivo de public", async () => {
        const restore = installPublicFetch("/ra2581392423047/")

        const response = await fetch("/ra2581392423047/content/pt-BR/profile.json")

        expect(response.status).toBe(200)
        expect(await response.text()).toBe(
            readFileSync("public/content/pt-BR/profile.json", "utf-8")
        )
        restore()
    })

    it("devolve 404 para arquivo inexistente", async () => {
        const restore = installPublicFetch("/")

        const response = await fetch("/content/pt-BR/nao-existe.json")

        expect(response.status).toBe(404)
        restore()
    })

    it("delega ao fetch original uma URL fora do base", async () => {
        const original = vi.fn(async () => new Response("original"))
        globalThis.fetch = original
        const restore = installPublicFetch("/ra2581392423047/")

        const response = await fetch("https://example.com/dados.json")

        expect(await response.text()).toBe("original")
        expect(original).toHaveBeenCalledTimes(1)
        restore()
    })

    it("restaura o fetch original", () => {
        const restore = installPublicFetch("/")

        expect(globalThis.fetch).not.toBe(originalFetch)

        restore()

        expect(globalThis.fetch).toBe(originalFetch)
    })

    it("decodifica o caminho antes de ler o arquivo", async () => {
        const restore = installPublicFetch("/")

        const response = await fetch("/content/pt-BR/%70rofile.json")

        expect(response.status).toBe(200)
        restore()
    })

    it("não guarda a leitura de arquivo ausente: depois de criado, a leitura funciona", async () => {
        const directory = mkdtempSync(join(tmpdir(), "public-fetch-"))
        const restore = installPublicFetch("/", directory)

        await expect(readText("late.json")).rejects.toThrow("status 404")
        writeFileSync(join(directory, "late.json"), "tarde")

        await expect(readText("late.json")).resolves.toBe("tarde")
        restore()
        rmSync(directory, { recursive: true })
    })

    it("lê o mesmo arquivo do disco uma vez só", async () => {
        const directory = mkdtempSync(join(tmpdir(), "public-fetch-"))
        const file = join(directory, "once.json")
        writeFileSync(file, "antigo")
        const restore = installPublicFetch("/", directory)

        await expect(readText("once.json")).resolves.toBe("antigo")
        writeFileSync(file, "novo")

        await expect(readText("once.json")).resolves.toBe("antigo")
        restore()
        rmSync(directory, { recursive: true })
    })
})
