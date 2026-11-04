import ROUTES from "@/routers/paths"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type Profile from "@/types/profile/Profile.types"
import type JsonLdNode from "@/types/seo/JsonLdNode.types"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"

type ContactJsonLdLabels = {
    title: string
    description: string
    name: string
}

function buildContactJsonLd(
    language: SupportedLanguage,
    labels: ContactJsonLdLabels,
    profile?: Profile
): JsonLdNode {
    const sameAs = [profile?.links.github, profile?.links.linkedin].filter((link): link is string =>
        Boolean(link)
    )

    return {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: labels.title,
        description: labels.description,
        url: buildAbsoluteUrl(ROUTES.contact, language),
        inLanguage: language,
        mainEntity: {
            "@type": "Person",
            "@id": `${buildAbsoluteUrl(ROUTES.home, language)}#person`,
            name: labels.name,
            email: profile ? `mailto:${profile.contact.email}` : undefined,
            sameAs: sameAs.length > 0 ? sameAs : undefined
        }
    }
}

export default buildContactJsonLd
