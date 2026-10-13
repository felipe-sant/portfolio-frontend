import { describe, expect, it } from "vitest"
import ContentException from "@/services/content/ContentException"
import validateLang from "@/services/content/validateLang"

describe("validateLang", () => {
    it.each(["pt-BR", "en", "es"])("aceita %s", (lang) => {
        expect(() => validateLang(lang)).not.toThrow()
    })

    it.each([undefined, "fr", "", "pt-br"])("rejeita %s com 400 UNSUPPORTED_LANGUAGE", (lang) => {
        try {
            validateLang(lang)
            expect.unreachable()
        } catch (error) {
            expect(error).toBeInstanceOf(ContentException)
            expect(error instanceof ContentException && error.contentError.status).toBe(400)
            expect(error instanceof ContentException && error.contentError.data.error.code).toBe(
                "UNSUPPORTED_LANGUAGE"
            )
        }
    })
})
