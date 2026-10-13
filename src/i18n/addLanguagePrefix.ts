import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function addLanguagePrefix(path: string, language: SupportedLanguage): string {
    return path === "/" ? `/${language}` : `/${language}${path}`
}

export default addLanguagePrefix
