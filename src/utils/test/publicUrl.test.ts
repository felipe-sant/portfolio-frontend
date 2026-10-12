import { afterEach, describe, expect, it, vi } from "vitest"

async function loadPublicUrl(base: string) {
    vi.stubEnv("BASE_URL", base)
    vi.resetModules()
    const { default: publicUrl } = await import("@/services/content/publicUrl")
    return publicUrl
}

afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe("publicUrl", () => {
    it("usa a raiz quando a base é /", async () => {
        const publicUrl = await loadPublicUrl("/")

        expect(publicUrl("content/pt-BR/profile.json")).toBe("/content/pt-BR/profile.json")
    })

    it("usa o prefixo do GitHub Pages", async () => {
        const publicUrl = await loadPublicUrl("/ra2581392423047/")

        expect(publicUrl("images/profile/photo-small.webp")).toBe(
            "/ra2581392423047/images/profile/photo-small.webp"
        )
    })

    it("aceita base sem barra final e caminho com barra inicial", async () => {
        const publicUrl = await loadPublicUrl("/ra2581392423047")

        expect(publicUrl("/content/en/projects.json")).toBe(
            "/ra2581392423047/content/en/projects.json"
        )
    })
})
