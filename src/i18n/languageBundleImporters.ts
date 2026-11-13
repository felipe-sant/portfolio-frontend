import type LanguageResources from "@/types/i18n/LanguageResources.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

type LanguageBundleImporter = () => Promise<{ default: LanguageResources }>

const LANGUAGE_BUNDLE_IMPORTERS: Record<SupportedLanguage, LanguageBundleImporter> = {
    "pt-BR": () => import("@/i18n/languageBundles/ptBR"),
    en: () => import("@/i18n/languageBundles/en"),
    es: () => import("@/i18n/languageBundles/es")
}

export default LANGUAGE_BUNDLE_IMPORTERS
