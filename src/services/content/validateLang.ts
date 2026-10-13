import ContentException from "@/services/content/ContentException"
import createContentError from "@/services/content/createContentError"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function isSupportedLanguage(lang: unknown): lang is SupportedLanguage {
    return SUPPORTED_LANGUAGES.some((supported) => supported === lang)
}

function validateLang(lang: unknown): asserts lang is SupportedLanguage {
    if (!isSupportedLanguage(lang)) {
        throw new ContentException(
            createContentError(
                400,
                "UNSUPPORTED_LANGUAGE",
                "O parâmetro lang aceita pt-BR, en ou es."
            )
        )
    }
}

export default validateLang
