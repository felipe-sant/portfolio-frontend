import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function getLanguageFromPath(pathname: string): SupportedLanguage | undefined {
    const [, firstSegment] = pathname.split("/")

    return SUPPORTED_LANGUAGES.find((language) => language === firstSegment)
}

export default getLanguageFromPath
