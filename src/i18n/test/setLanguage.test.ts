import { describe, expect, it } from "vitest"
import i18n from "@/i18n/i18n"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"
import setLanguage from "@/i18n/setLanguage"

describe("setLanguage", () => {
    it("troca o texto devolvido por t()", async () => {
        await setLanguage("es")

        expect(i18n.t("loading")).toBe("Cargando...")
    })

    it("grava o idioma escolhido em LANGUAGE_STORAGE_KEY", async () => {
        await setLanguage("en")

        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en")
    })

    it("atualiza o lang do html", async () => {
        await setLanguage("es")

        expect(document.documentElement.lang).toBe("es")
    })
})
