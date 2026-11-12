import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

type RootPageTexts = {
    title: string
    description: string
    languageLabel: string
    heading: Record<SupportedLanguage, string>
    link: Record<SupportedLanguage, string>
}

export default RootPageTexts
