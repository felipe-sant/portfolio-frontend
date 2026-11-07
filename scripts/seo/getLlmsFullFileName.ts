import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const FILE_NAMES: Record<SupportedLanguage, string> = {
    "pt-BR": "llms-full.txt",
    en: "llms-full.en.txt",
    es: "llms-full.es.txt"
}

function getLlmsFullFileName(language: SupportedLanguage): string {
    return FILE_NAMES[language]
}

export default getLlmsFullFileName
