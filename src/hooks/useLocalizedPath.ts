import { useTranslation } from "react-i18next"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import buildPath from "@/routers/buildPath"

function useLocalizedPath() {
    const { i18n } = useTranslation()
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE

    return (path: string, params?: Record<string, string>) => buildPath(path, language, params)
}

export default useLocalizedPath
