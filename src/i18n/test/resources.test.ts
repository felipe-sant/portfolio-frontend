import { describe, expect, it } from "vitest"
import en from "@/i18n/languageBundles/en"
import es from "@/i18n/languageBundles/es"
import ptBR from "@/i18n/languageBundles/ptBR"
import NAMESPACES from "@/i18n/namespaces"
import resources from "@/i18n/resources"

function collectEntries(value: unknown, path = ""): [string, unknown][] {
    if (typeof value !== "object" || value === null) {
        return [[path, value]]
    }

    return Object.entries(value).flatMap(([key, child]) =>
        collectEntries(child, path ? `${path}.${key}` : key)
    )
}

function collectPaths(value: unknown) {
    return collectEntries(value)
        .map(([path]) => path)
        .toSorted()
}

const languages = Object.entries(resources)

describe("resources", () => {
    it("declara pt-BR, en e es", () => {
        expect(Object.keys(resources).toSorted()).toEqual(["en", "es", "pt-BR"])
    })

    it("compõe cada idioma a partir de languageBundles, com os oito namespaces", () => {
        expect(resources).toEqual({ "pt-BR": ptBR, en, es })
        expect(Object.keys(resources["pt-BR"]).toSorted()).toEqual(NAMESPACES.toSorted())
    })

    it.each(languages)("%s tem os mesmos namespaces que pt-BR", (_language, namespaces) => {
        expect(Object.keys(namespaces).toSorted()).toEqual(
            Object.keys(resources["pt-BR"]).toSorted()
        )
    })

    it.each(languages)("%s tem os mesmos caminhos de chave que pt-BR", (_language, namespaces) => {
        expect(collectPaths(namespaces)).toEqual(collectPaths(resources["pt-BR"]))
    })

    it.each(languages)("%s não tem valor vazio nem que não seja texto", (_language, namespaces) => {
        for (const [path, value] of collectEntries(namespaces)) {
            expect(typeof value, path).toBe("string")
            expect(value, path).not.toBe("")
        }
    })

    it.each(languages)("%s tem about.updatedAt com a data interpolada", (_language, namespaces) => {
        expect(namespaces.about.updatedAt).toContain("{{date}}")
    })

    it.each(languages)(
        "%s tem project.meta.documentDescription com o documento e o projeto interpolados",
        (_language, namespaces) => {
            expect(namespaces.project.meta.documentDescription).toContain("{{document}}")
            expect(namespaces.project.meta.documentDescription).toContain("{{project}}")
        }
    )
})
