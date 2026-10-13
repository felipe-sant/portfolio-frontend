import i18n from "@/i18n/i18n"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function createLanguageLoader(language: SupportedLanguage) {
    return async () => {
        await i18n.changeLanguage(language)

        return null
    }
}

export default createLanguageLoader
