import { describe, expect, it } from "vitest"
import addLanguagePrefix from "@/i18n/addLanguagePrefix"

describe("addLanguagePrefix", () => {
    it.each([
        ["/", "pt-BR", "/pt-BR"],
        ["/", "en", "/en"],
        ["/", "es", "/es"],
        ["/projects", "en", "/en/projects"],
        ["/projects/0190-abc", "pt-BR", "/pt-BR/projects/0190-abc"]
    ] as const)("transforma %s em %s com o idioma %s", (path, language, expected) => {
        expect(addLanguagePrefix(path, language)).toBe(expected)
    })
})
