import { afterEach, describe, expect, it, vi } from "vitest"

const SITE_URL = "https://fatec-jacarei-dsm-portfolio.github.io"

async function loadBuildAbsoluteUrl(base: string, siteUrl: string = SITE_URL) {
    vi.stubEnv("BASE_URL", base)
    vi.stubEnv("VITE_SITE_URL", siteUrl)
    vi.resetModules()
    const { default: buildAbsoluteUrl } = await import("@/utils/buildAbsoluteUrl")
    return buildAbsoluteUrl
}

afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe("buildAbsoluteUrl", () => {
    it.each(["pt-BR", "en", "es"] as const)(
        "monta a raiz do idioma %s sem barra final",
        async (language) => {
            const buildAbsoluteUrl = await loadBuildAbsoluteUrl("/")

            expect(buildAbsoluteUrl("/", language)).toBe(`${SITE_URL}/${language}`)
        }
    )

    it("acrescenta o caminho da rota depois do idioma", async () => {
        const buildAbsoluteUrl = await loadBuildAbsoluteUrl("/")

        expect(buildAbsoluteUrl("/projects", "en")).toBe(`${SITE_URL}/en/projects`)
    })

    it("preenche os parâmetros da rota", async () => {
        const buildAbsoluteUrl = await loadBuildAbsoluteUrl("/")

        expect(buildAbsoluteUrl("/projects/:id", "es", { id: "abc" })).toBe(
            `${SITE_URL}/es/projects/abc`
        )
    })

    it("inclui o base uma única vez", async () => {
        const buildAbsoluteUrl = await loadBuildAbsoluteUrl("/ra2581392423047/")

        expect(buildAbsoluteUrl("/", "pt-BR")).toBe(`${SITE_URL}/ra2581392423047/pt-BR`)
        expect(buildAbsoluteUrl("/projects", "pt-BR")).toBe(
            `${SITE_URL}/ra2581392423047/pt-BR/projects`
        )
    })

    it("normaliza a origem com barra final e nunca duplica a barra", async () => {
        const buildAbsoluteUrl = await loadBuildAbsoluteUrl("/ra2581392423047/", `${SITE_URL}/`)
        const url = buildAbsoluteUrl("/projects", "en")

        expect(url).toBe(`${SITE_URL}/ra2581392423047/en/projects`)
        expect(url.replace("https://", "")).not.toContain("//")
    })
})
