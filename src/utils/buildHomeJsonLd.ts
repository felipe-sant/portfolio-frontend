import ROUTES from "@/routers/paths"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type Profile from "@/types/profile/Profile.types"
import type JsonLdNode from "@/types/seo/JsonLdNode.types"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"

type HomeJsonLdLabels = {
    name: string
    jobTitle: string
}

function buildHomeJsonLd(
    language: SupportedLanguage,
    labels: HomeJsonLdLabels,
    profile?: Profile
): JsonLdNode {
    const url = buildAbsoluteUrl(ROUTES.home, language)
    const personId = `${url}#person`
    const sameAs = [profile?.links.github, profile?.links.linkedin].filter((link): link is string =>
        Boolean(link)
    )
    const knowsAbout = Array.from(
        new Set(profile?.stack.flatMap((group) => group.items.map((item) => item.name)))
    )

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "WebSite",
                name: labels.name,
                url,
                inLanguage: language,
                publisher: { "@id": personId }
            },
            {
                "@type": "Person",
                "@id": personId,
                name: labels.name,
                jobTitle: labels.jobTitle,
                url,
                sameAs: sameAs.length > 0 ? sameAs : undefined,
                knowsAbout: knowsAbout.length > 0 ? knowsAbout : undefined
            }
        ]
    }
}

export default buildHomeJsonLd
