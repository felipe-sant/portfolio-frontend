import { afterEach, describe, expect, it, vi } from "vitest"

const SITE_URL = "https://fatec-jacarei-dsm-portfolio.github.io"

async function loadBuildPersonId(base: string, siteUrl: string = SITE_URL) {
    vi.stubEnv("BASE_URL", base)
    vi.stubEnv("VITE_SITE_URL", siteUrl)
    vi.resetModules()
    const { default: buildPersonId } = await import("@/utils/buildPersonId")
    return buildPersonId
}

afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe("buildPersonId", () => {
    it("normaliza a origem com barra final e nunca duplica a barra", async () => {
        const buildPersonId = await loadBuildPersonId("/ra2581392423047/", `${SITE_URL}/`)
        const id = buildPersonId()

        expect(id).toBe(`${SITE_URL}/ra2581392423047/#person`)
        expect(id.replace("https://", "")).not.toContain("//")
    })

    it("inclui o base de subpasta uma única vez", async () => {
        const buildPersonId = await loadBuildPersonId("/ra2581392423047/")
        const id = buildPersonId()

        expect(id.split("ra2581392423047")).toHaveLength(2)
    })

    it("aponta a raiz do site sem prefixo de idioma com base na raiz", async () => {
        const buildPersonId = await loadBuildPersonId("/")
        const id = buildPersonId()

        expect(id).toBe(`${SITE_URL}/#person`)
        expect(id).not.toMatch(/\/(pt-BR|en|es)(\/|#)/)
    })
})
