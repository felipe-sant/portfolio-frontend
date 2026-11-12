import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import getLanguage from "@/i18n/getLanguage"
import i18n from "@/i18n/i18n"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"
import NAMESPACES from "@/i18n/namespaces"
import setLanguage from "@/i18n/setLanguage"
import parseUntyped from "@/testUtils/parseUntyped"

describe("setLanguage", () => {
    it("troca o texto devolvido por t()", async () => {
        await setLanguage("es")

        expect(i18n.t("loading")).toBe("Cargando...")
    })

    it("grava o idioma escolhido em LANGUAGE_STORAGE_KEY", async () => {
        await setLanguage("en")

        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en")
    })

    it("carrega en antes de trocar quando o idioma não estava na instância", async () => {
        for (const namespace of NAMESPACES) {
            i18n.removeResourceBundle("en", namespace)
        }
        const common = parseUntyped(readFileSync("src/locales/en/common.json", "utf-8"))

        await setLanguage("en")

        expect(getLanguage()).toBe("en")
        expect(i18n.t("common:resume.modal.title")).toBe(common.resume.modal.title)
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en")
    })

    it("atualiza o lang do html", async () => {
        await setLanguage("es")

        expect(document.documentElement.lang).toBe("es")
    })
})
