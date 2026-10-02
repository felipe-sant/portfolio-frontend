import { describe, expect, it } from "vitest"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"

describe("resolveSupportedLanguage", () => {
    it.each(["pt-BR", "en", "es"])("devolve o próprio código suportado %s", (code) => {
        expect(resolveSupportedLanguage(code)).toBe(code)
    })

    it.each([
        ["es-MX", "es"],
        ["en-GB", "en"],
        ["en-US", "en"],
        ["pt-PT", "pt-BR"],
        ["pt", "pt-BR"]
    ])("mapeia a variante regional %s para %s", (code, expected) => {
        expect(resolveSupportedLanguage(code)).toBe(expected)
    })

    it.each(["fr-FR", "de-DE", "xx", ""])(
        "devolve undefined para o código não suportado %j",
        (code) => {
            expect(resolveSupportedLanguage(code)).toBeUndefined()
        }
    )

    it("devolve undefined para null e undefined", () => {
        expect(resolveSupportedLanguage(null)).toBeUndefined()
        expect(resolveSupportedLanguage(undefined)).toBeUndefined()
    })
})
