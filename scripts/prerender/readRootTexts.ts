import { readFile } from "node:fs/promises"
import { join } from "node:path"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type RootPageTexts from "@/types/prerender/RootPageTexts.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

async function readJsonFile(path: string): Promise<unknown> {
    return JSON.parse(await readFile(path, "utf-8"))
}

function readString(source: unknown, keys: string[], lang: SupportedLanguage, file: string) {
    const value = keys.reduce<unknown>(
        (current, key) =>
            typeof current === "object" && current !== null ? Reflect.get(current, key) : undefined,
        source
    )

    if (typeof value !== "string") {
        throw new Error(`A chave "${keys.join(".")}" não existe em ${file} de "${lang}".`)
    }

    return value
}

async function readRootTexts(localesDirectory = "src/locales"): Promise<RootPageTexts> {
    const [ptBR, en, es] = await Promise.all(
        SUPPORTED_LANGUAGES.map((lang) => readJsonFile(join(localesDirectory, lang, "common.json")))
    )
    const commons: Record<SupportedLanguage, unknown> = { "pt-BR": ptBR, en, es }
    const home = await readJsonFile(join(localesDirectory, FALLBACK_LANGUAGE, "home.json"))
    const pick = (keys: string[]): Record<SupportedLanguage, string> => ({
        "pt-BR": readString(commons["pt-BR"], keys, "pt-BR", "common.json"),
        en: readString(commons.en, keys, "en", "common.json"),
        es: readString(commons.es, keys, "es", "common.json")
    })

    return {
        title: readString(home, ["meta", "title"], FALLBACK_LANGUAGE, "home.json"),
        description: readString(home, ["meta", "description"], FALLBACK_LANGUAGE, "home.json"),
        languageLabel: readString(
            commons[FALLBACK_LANGUAGE],
            ["languageSelector", "label"],
            FALLBACK_LANGUAGE,
            "common.json"
        ),
        heading: pick(["root", "heading"]),
        link: pick(["root", "link"])
    }
}

export default readRootTexts
