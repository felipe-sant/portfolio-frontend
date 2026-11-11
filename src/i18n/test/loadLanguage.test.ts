import { readdirSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"
import { afterEach, describe, expect, it, vi } from "vitest"
import i18n from "@/i18n/i18n"
import LANGUAGE_BUNDLE_IMPORTERS from "@/i18n/languageBundleImporters"
import loadLanguage from "@/i18n/loadLanguage"
import NAMESPACES from "@/i18n/namespaces"
import resources from "@/i18n/resources"

const SOURCE_ROOT = join(process.cwd(), "src")
const STATIC_TEXT_IMPORT =
    /^import (?!type )[^"]*from "(@\/i18n\/resources|@\/i18n\/addStaticResources|@\/i18n\/languageBundles\/|@\/locales\/)/m

function listSources(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name)

        if (entry.isDirectory()) {
            return entry.name === "test" ? [] : listSources(path)
        }

        return /\.tsx?$/.test(entry.name) ? [path] : []
    })
}

function removeSpanish() {
    for (const namespace of NAMESPACES) {
        i18n.removeResourceBundle("es", namespace)
    }
}

function spanishNamespacesLoaded() {
    return NAMESPACES.filter((namespace) => i18n.hasResourceBundle("es", namespace))
}

afterEach(() => {
    vi.restoreAllMocks()
    for (const [namespace, bundle] of Object.entries(resources.es)) {
        i18n.addResourceBundle("es", namespace, bundle, true, true)
    }
})

describe("loadLanguage", () => {
    it("deixa os oito namespaces de es disponíveis depois de removidos", async () => {
        removeSpanish()

        await loadLanguage("es")

        expect(spanishNamespacesLoaded()).toEqual(NAMESPACES)
        expect(NAMESPACES).toHaveLength(8)
    })

    it("devolve a mesma promessa e importa uma vez em chamadas simultâneas", async () => {
        removeSpanish()
        const importer = vi.spyOn(LANGUAGE_BUNDLE_IMPORTERS, "es")

        const first = loadLanguage("es")
        const second = loadLanguage("es")
        await first

        expect(second).toBe(first)
        expect(importer).toHaveBeenCalledTimes(1)
    })

    it("não importa o idioma que já tem os oito namespaces", async () => {
        const importer = vi.spyOn(LANGUAGE_BUNDLE_IMPORTERS, "es")

        await loadLanguage("es")

        expect(importer).not.toHaveBeenCalled()
    })

    it("rejeita quando a importação falha e tenta de novo na chamada seguinte", async () => {
        removeSpanish()
        const importer = vi
            .spyOn(LANGUAGE_BUNDLE_IMPORTERS, "es")
            .mockRejectedValueOnce(new Error("rede"))

        await expect(loadLanguage("es")).rejects.toThrow("rede")
        await loadLanguage("es")

        expect(importer).toHaveBeenCalledTimes(2)
        expect(spanishNamespacesLoaded()).toEqual(NAMESPACES)
    })

    it("só o servidor, os testes e os próprios pacotes importam os textos de forma estática", () => {
        const importers = listSources(SOURCE_ROOT)
            .filter((path) => STATIC_TEXT_IMPORT.test(readFileSync(path, "utf-8")))
            .map((path) => relative(SOURCE_ROOT, path))
            .toSorted()

        expect(importers).toEqual([
            "entry-server.tsx",
            "i18n/addStaticResources.ts",
            "i18n/languageBundles/en.ts",
            "i18n/languageBundles/es.ts",
            "i18n/languageBundles/ptBR.ts",
            "i18n/resources.ts",
            "setupTests.ts"
        ])
    })
})
