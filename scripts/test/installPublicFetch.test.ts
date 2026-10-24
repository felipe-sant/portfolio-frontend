import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"
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
})
