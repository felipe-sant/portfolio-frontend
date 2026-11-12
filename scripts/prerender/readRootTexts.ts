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
            typeof current === "object" && current !== null
                ? (current as { [name: string]: unknown })[key]
                : undefined,
        source
    )

    if (typeof value !== "string") {
        throw new Error(`A chave "${keys.join(".")}" não existe em ${file} de "${lang}".`)
    }

    return value
}

async function readRootTexts(localesDirectory = "src/locales"): Promise<RootPageTexts> {
    const commons = await Promise.all(
        SUPPORTED_LANGUAGES.map(
            async (lang) =>
                [lang, await readJsonFile(join(localesDirectory, lang, "common.json"))] as const
        )
    )
    const home = await readJsonFile(join(localesDirectory, FALLBACK_LANGUAGE, "home.json"))
    const fallbackCommon = Object.fromEntries(commons)[FALLBACK_LANGUAGE]
    const pick = (keys: string[]) =>
        Object.fromEntries(
            commons.map(([lang, common]) => [lang, readString(common, keys, lang, "common.json")])
        ) as Record<SupportedLanguage, string>

    return {
        title: readString(home, ["meta", "title"], FALLBACK_LANGUAGE, "home.json"),
        description: readString(home, ["meta", "description"], FALLBACK_LANGUAGE, "home.json"),
        languageLabel: readString(
            fallbackCommon,
            ["languageSelector", "label"],
            FALLBACK_LANGUAGE,
            "common.json"
        ),
        heading: pick(["root", "heading"]),
        link: pick(["root", "link"])
    }
}

export default readRootTexts
