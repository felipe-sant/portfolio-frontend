import { readFile, readdir } from "node:fs/promises"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import enProject from "@/locales/en/project.json"
import esProject from "@/locales/es/project.json"
import ptBRProject from "@/locales/pt-BR/project.json"
import CODE_LANGUAGE_ALIASES from "@/utils/codeLanguageAliases"
import CODE_LANGUAGES from "@/utils/codeLanguages"
import resolveCodeLanguage from "@/utils/resolveCodeLanguage"

const CONTENT_ROOT = join(process.cwd(), "public", "content")

async function collectDocuments(directory: string): Promise<string[]> {
    const entries = await readdir(directory, { withFileTypes: true })
    const nested = await Promise.all(
        entries.map(async (entry) => {
            const path = join(directory, entry.name)

            if (entry.isDirectory()) {
                return collectDocuments(path)
            }

            return entry.name.endsWith(".md") ? [path] : []
        })
    )

    return nested.flat()
}

async function collectFenceLanguages() {
    const files = await collectDocuments(CONTENT_ROOT)
    const languages = new Set<string>()

    for (const file of files) {
        const text = await readFile(file, "utf-8")

        for (const match of text.matchAll(/^```(\S*)/gm)) {
            if (match[1]) {
                languages.add(match[1])
            }
        }
    }

    return languages
}

describe("linguagens de código do conteúdo", () => {
    it("o registro tem exatamente as oito linguagens decididas", () => {
        expect(Object.keys(CODE_LANGUAGES).toSorted()).toEqual(
            ["bash", "env", "java", "javascript", "json", "python", "tsx", "typescript"].toSorted()
        )
        expect(CODE_LANGUAGE_ALIASES).toEqual({
            typescript: ["ts"],
            javascript: ["js"],
            python: ["py"],
            bash: ["sh"]
        })
    })

    it("toda linguagem usada nos documentos está no registro e tem chave nos três idiomas", async () => {
        const used = await collectFenceLanguages()

        for (const name of used) {
            const language = resolveCodeLanguage(name)

            expect(language, `linguagem ${name} fora do registro`).toBeDefined()
            if (language) {
                expect(ptBRProject.codeBlock.language).toHaveProperty(language)
                expect(enProject.codeBlock.language).toHaveProperty(language)
                expect(esProject.codeBlock.language).toHaveProperty(language)
            }
        }
    })
})
