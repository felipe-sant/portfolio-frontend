import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function normalizeSearchText(text: string, lang: SupportedLanguage): string {
    return text.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase(lang)
}

export default normalizeSearchText
