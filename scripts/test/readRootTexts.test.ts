import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterEach, describe, expect, it } from "vitest"
import readRootTexts from "@scripts/prerender/readRootTexts"

const directories: string[] = []

function buildLocales(overrides: { [path: string]: unknown } = {}): string {
    const directory = mkdtempSync(join(tmpdir(), "root-texts-"))
    directories.push(directory)

    for (const lang of ["pt-BR", "en", "es"]) {
        mkdirSync(join(directory, lang))
        const common = {
            languageSelector: { label: `label-${lang}` },
            root: { heading: `heading-${lang}`, link: `link-${lang}` }
        }
        const home = { meta: { title: `title-${lang}`, description: `description-${lang}` } }
        writeFileSync(
            join(directory, lang, "common.json"),
            JSON.stringify(overrides[`${lang}/common`] ?? common)
        )
        writeFileSync(join(directory, lang, "home.json"), JSON.stringify(home))
    }

    return directory
}

afterEach(() => {
    directories.splice(0).forEach((directory) => rmSync(directory, { recursive: true }))
})

describe("readRootTexts", () => {
    it("devolve heading e link de cada idioma, o rótulo e o meta do en", async () => {
        const texts = await readRootTexts(buildLocales())

        expect(texts).toEqual({
            title: "title-en",
            description: "description-en",
            languageLabel: "label-en",
            heading: {
                "pt-BR": "heading-pt-BR",
                en: "heading-en",
                es: "heading-es"
            },
            link: { "pt-BR": "link-pt-BR", en: "link-en", es: "link-es" }
        })
    })

    it("falha citando o idioma e a chave quando uma chave falta", async () => {
        const directory = buildLocales({
            "es/common": { languageSelector: { label: "x" }, root: { heading: "x" } }
        })

        await expect(readRootTexts(directory)).rejects.toThrow(/"root\.link".*"es"/)
    })

    it("lê os três common.json reais com os valores da spec", async () => {
        const texts = await readRootTexts()

        expect(texts.heading).toEqual({
            "pt-BR": "Luiz Felipe dos Santos",
            en: "Luiz Felipe dos Santos",
            es: "Luiz Felipe dos Santos"
        })
        expect(texts.link).toEqual({
            "pt-BR": "Ver o portfólio em português",
            en: "View the portfolio in English",
            es: "Ver el portafolio en español"
        })
        expect(texts.languageLabel).toBe("Language")
    })
})
