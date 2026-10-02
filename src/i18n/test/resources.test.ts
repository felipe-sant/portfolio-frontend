import { describe, expect, it } from "vitest"
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
})
