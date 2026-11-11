import i18n from "@/i18n/i18n"
import loadLanguage from "@/i18n/loadLanguage"
import saveLanguage from "@/i18n/saveLanguage"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

async function setLanguage(language: SupportedLanguage): Promise<void> {
    await loadLanguage(language)
    await i18n.changeLanguage(language)
    saveLanguage(language)
}

export default setLanguage
