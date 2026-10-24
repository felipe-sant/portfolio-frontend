import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

async function readNoscriptText(lang: SupportedLanguage, localesDirectory = "src/locales") {
    const text = await readFile(join(localesDirectory, lang, "common.json"), "utf-8")
    const common: { noscript?: unknown } = JSON.parse(text)

    if (typeof common.noscript !== "string") {
        throw new Error(`A chave "noscript" não existe em common.json de "${lang}".`)
    }

    return common.noscript
}

export default readNoscriptText
