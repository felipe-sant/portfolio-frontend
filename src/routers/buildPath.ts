import { generatePath } from "react-router-dom"
import addLanguagePrefix from "@/i18n/addLanguagePrefix"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function buildPath(
    path: string,
    language: SupportedLanguage,
    params?: Record<string, string>
): string {
    return addLanguagePrefix(generatePath(path, params), language)
}

export default buildPath
