import { readFileSync } from "node:fs"
import { afterEach, describe, expect, it, vi } from "vitest"
import i18n from "@/i18n/i18n"
import LANGUAGE_BUNDLE_IMPORTERS from "@/i18n/languageBundleImporters"
import NAMESPACES from "@/i18n/namespaces"
import setLanguage from "@/i18n/setLanguage"
import createLanguageLoader from "@/routers/createLanguageLoader"
import parseUntyped from "@/testUtils/parseUntyped"

function readResumeModalTitle(language: string) {
    const common = parseUntyped(readFileSync(`src/locales/${language}/common.json`, "utf-8"))

    return common.resume.modal.title
}

function removeSpanish() {
    for (const namespace of NAMESPACES) {
        i18n.removeResourceBundle("es", namespace)
    }
}

afterEach(() => {
    vi.restoreAllMocks()
})

describe("createLanguageLoader", () => {
    it("carrega es antes de trocar quando o idioma não estava na instância", async () => {
        removeSpanish()

        await createLanguageLoader("es")()

        expect(i18n.resolvedLanguage).toBe("es")
        expect(i18n.t("common:resume.modal.title")).toBe(readResumeModalTitle("es"))
    })

    it("importa es uma vez quando setLanguage e o loader pedem o idioma juntos", async () => {
        removeSpanish()
        const importer = vi.spyOn(LANGUAGE_BUNDLE_IMPORTERS, "es")

        await Promise.all([setLanguage("es"), createLanguageLoader("es")()])

        expect(importer).toHaveBeenCalledTimes(1)
        expect(i18n.resolvedLanguage).toBe("es")
    })
})
