import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type SeoLanguageContent from "@/types/seo/SeoLanguageContent.types"

type SeoContent = Record<SupportedLanguage, SeoLanguageContent>

export default SeoContent
