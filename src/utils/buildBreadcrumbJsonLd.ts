import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type JsonLdNode from "@/types/seo/JsonLdNode.types"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"

type BreadcrumbItem = {
    name: string
    path: string
    params?: Record<string, string>
}

function buildBreadcrumbJsonLd(language: SupportedLanguage, items: BreadcrumbItem[]): JsonLdNode {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: buildAbsoluteUrl(item.path, language, item.params)
        }))
    }
}

export default buildBreadcrumbJsonLd
