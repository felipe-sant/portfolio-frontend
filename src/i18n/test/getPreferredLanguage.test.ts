import { afterEach, describe, expect, it, vi } from "vitest"
import getPreferredLanguage from "@/i18n/getPreferredLanguage"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"

function stubBrowser(languages: string[]) {
    vi.spyOn(navigator, "languages", "get").mockReturnValue(languages)
    vi.spyOn(navigator, "language", "get").mockReturnValue(languages[0] ?? "")
}

afterEach(() => {
    vi.restoreAllMocks()
    localStorage.removeItem(LANGUAGE_STORAGE_KEY)
})

describe("getPreferredLanguage", () => {
    it("devolve a escolha salva acima do navegador", () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, "es")
        stubBrowser(["en-US"])

        expect(getPreferredLanguage()).toBe("es")
    })

    it.each([
        ["pt-PT", "pt-BR"],
        ["es-MX", "es"],
        ["en-US", "en"]
    ])("segue o navegador %s sem escolha salva", (browserLanguage, expected) => {
        stubBrowser([browserLanguage])

        expect(getPreferredLanguage()).toBe(expected)
    })

    it("usa o primeiro idioma resolvível da lista do navegador", () => {
        stubBrowser(["fr-FR", "es-AR", "en"])

        expect(getPreferredLanguage()).toBe("es")
    })

    it("cai em en com o navegador em fr e nada salvo", () => {
        stubBrowser(["fr-FR"])

        expect(getPreferredLanguage()).toBe("en")
    })

    it("cai em en quando o navegador não informa idioma", () => {
        stubBrowser([])

        expect(getPreferredLanguage()).toBe("en")
    })

    it("ignora uma escolha salva inválida", () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, "xx")
        stubBrowser(["es"])

        expect(getPreferredLanguage()).toBe("es")
    })

    it("segue o navegador quando o localStorage lança", () => {
        vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
            throw new Error("storage bloqueado")
        })
        stubBrowser(["es"])

        expect(getPreferredLanguage()).toBe("es")
    })
})
