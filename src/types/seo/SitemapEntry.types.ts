import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

type SitemapEntry = {
    path: string
    alternates: Record<SupportedLanguage, string>
    lastmod?: string
}

export default SitemapEntry
