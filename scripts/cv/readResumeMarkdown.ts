import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function readResumeMarkdown(language: SupportedLanguage, directory: string): string {
    const file = join(directory, `cv-${language}.md`)

    if (!existsSync(file)) {
        throw new Error(`Markdown do currículo ausente para o idioma ${language}: ${file}`)
    }

    const markdown = readFileSync(file, "utf-8")

    if (markdown.trim() === "") {
        throw new Error(`Markdown do currículo vazio para o idioma ${language}: ${file}`)
    }

    return markdown
}

export default readResumeMarkdown
