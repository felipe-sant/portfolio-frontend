import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type SharePage from "@/types/seo/SharePage.types"

function buildShareImagePath(page: SharePage, language: SupportedLanguage): string {
    return `images/share/${language}/${page}.png`
}

export default buildShareImagePath
