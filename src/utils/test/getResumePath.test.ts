import { afterEach, describe, expect, it, vi } from "vitest"

async function loadGetResumePath(base: string) {
    vi.stubEnv("BASE_URL", base)
    vi.resetModules()
    const { default: getResumePath } = await import("@/utils/getResumePath")
    return getResumePath
}

afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
})

describe("getResumePath", () => {
    it.each([
        ["pt-BR", "/cv/cv-pt-BR.pdf"],
        ["en", "/cv/cv-en.pdf"],
        ["es", "/cv/cv-es.pdf"]
    ] as const)("devolve o PDF do idioma %s", async (language, expected) => {
        const getResumePath = await loadGetResumePath("/")

        expect(getResumePath(language)).toBe(expected)
    })

    it("devolve o Markdown do idioma quando o formato é md", async () => {
        const getResumePath = await loadGetResumePath("/")

        expect(getResumePath("en", "md")).toBe("/cv/cv-en.md")
    })

    it("respeita o prefixo do GitHub Pages", async () => {
        const getResumePath = await loadGetResumePath("/ra2581392423047/")

        expect(getResumePath("es")).toBe("/ra2581392423047/cv/cv-es.pdf")
    })
})
