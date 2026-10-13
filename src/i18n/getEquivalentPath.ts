import addLanguagePrefix from "@/i18n/addLanguagePrefix"
import stripLanguagePrefix from "@/i18n/stripLanguagePrefix"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function getEquivalentPath(pathname: string, language: SupportedLanguage): string {
    return addLanguagePrefix(stripLanguagePrefix(pathname), language)
}

export default getEquivalentPath
