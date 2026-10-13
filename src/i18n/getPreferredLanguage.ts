import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function readSavedLanguage(): SupportedLanguage | undefined {
    try {
        return resolveSupportedLanguage(localStorage.getItem(LANGUAGE_STORAGE_KEY))
    } catch {
        return undefined
    }
}

function readBrowserLanguage(): SupportedLanguage | undefined {
    const codes = [...(navigator.languages ?? []), navigator.language]

    for (const code of codes) {
        const language = resolveSupportedLanguage(code)

        if (language) {
            return language
        }
    }

    return undefined
}

function getPreferredLanguage(): SupportedLanguage {
    return readSavedLanguage() ?? readBrowserLanguage() ?? FALLBACK_LANGUAGE
}

export default getPreferredLanguage
