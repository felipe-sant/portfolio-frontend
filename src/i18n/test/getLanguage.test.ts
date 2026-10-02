import { afterEach, describe, expect, it, vi } from "vitest"
import getLanguage from "@/i18n/getLanguage"
import i18n from "@/i18n/i18n"

async function loadGetLanguageWithBrowserLanguages(browserLanguages: string[]) {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(browserLanguages)
    vi.spyOn(navigator, "language", "get").mockReturnValue(browserLanguages[0] ?? "")
    vi.resetModules()

    const { default: freshGetLanguage } = await import("@/i18n/getLanguage")

    return freshGetLanguage
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe("getLanguage", () => {
    it.each(["pt-BR", "en", "es"] as const)(
        "devolve %s depois da troca de idioma",
        async (language) => {
            await i18n.changeLanguage(language)

            expect(getLanguage()).toBe(language)
        }
    )

    it("devolve en quando o idioma do navegador não é suportado", async () => {
        const freshGetLanguage = await loadGetLanguageWithBrowserLanguages(["fr-FR"])

        expect(freshGetLanguage()).toBe("en")
    })

    it("devolve en quando não há idioma resolvido", () => {
        i18n.resolvedLanguage = undefined

        expect(getLanguage()).toBe("en")
    })
})
