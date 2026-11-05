import publicUrl from "@/utils/publicUrl"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function getResumePath(language: SupportedLanguage, format: "pdf" | "md" = "pdf"): string {
    return publicUrl(`cv/cv-${language}.${format}`)
}

export default getResumePath
