import { describe, expect, it } from "vitest"
import getLanguageFromPath from "@/i18n/getLanguageFromPath"

describe("getLanguageFromPath", () => {
    it.each([
        ["/pt-BR", "pt-BR"],
        ["/en", "en"],
        ["/es", "es"],
        ["/en/", "en"],
        ["/en/projects", "en"],
        ["/es/projects/0190-abc/docs/architecture.md", "es"],
        ["/pt-BR/about", "pt-BR"]
    ])("devolve o idioma de %s", (pathname, expected) => {
        expect(getLanguageFromPath(pathname)).toBe(expected)
    })

    it.each([
        ["/"],
        ["/entities"],
        ["/pt"],
        ["/fr/projects"],
        ["/projects"],
        ["/projects/en"],
        [""]
    ])("devolve undefined para %s", (pathname) => {
        expect(getLanguageFromPath(pathname)).toBeUndefined()
    })
})
