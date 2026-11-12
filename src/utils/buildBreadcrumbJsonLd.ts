import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type BreadcrumbItem from "@/types/seo/BreadcrumbItem.types"
import type JsonLdNode from "@/types/seo/JsonLdNode.types"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"

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
