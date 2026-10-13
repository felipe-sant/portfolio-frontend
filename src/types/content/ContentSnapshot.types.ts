import type ContentIssue from "@/types/content/ContentIssue.types"
import type LanguageContent from "@/types/content/LanguageContent.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

type ContentSnapshot = {
    languages: Record<SupportedLanguage, LanguageContent>
    files: Record<string, Uint8Array>
    issues: ContentIssue[]
}

export default ContentSnapshot
