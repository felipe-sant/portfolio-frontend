import ROUTES from "@/routers/paths"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type Profile from "@/types/profile/Profile.types"
import type JsonLdNode from "@/types/seo/JsonLdNode.types"
import type Timeline from "@/types/timeline/Timeline.types"
import type TimelineItem from "@/types/timeline/TimelineItem.types"
import type TimelineKind from "@/types/timeline/TimelineKind.types"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"
import buildPersonId from "@/utils/buildPersonId"
import getSiteUrl from "@/utils/getSiteUrl"
import publicUrl from "@/utils/publicUrl"

type AboutJsonLdLabels = {
    name: string
}

function itemsOf(timeline: Timeline | undefined, kind: TimelineKind): TimelineItem[] {
    return (timeline?.groups ?? [])
        .filter((group) => group.kind === kind)
        .flatMap((group) => group.items)
}

function uniqueOrganizations(items: TimelineItem[]): string[] {
    return Array.from(
        new Set(
            items.map((item) => item.organization).filter((name): name is string => Boolean(name))
        )
    )
}

function orUndefined<T>(list: T[]): T[] | undefined {
    return list.length > 0 ? list : undefined
}

function buildAboutJsonLd(
    language: SupportedLanguage,
    labels: AboutJsonLdLabels,
    profile?: Profile,
    timeline?: Timeline
): JsonLdNode {
    const homeUrl = buildAbsoluteUrl(ROUTES.home, language)
    const sameAs = [profile?.links.github, profile?.links.linkedin].filter((link): link is string =>
        Boolean(link)
    )
    const knowsAbout = Array.from(
        new Set(profile?.stack.flatMap((group) => group.items.map((item) => item.name)))
    )
    const experiences = itemsOf(timeline, "experience")
    const alumniOf = uniqueOrganizations(itemsOf(timeline, "education"))
    const worksFor = uniqueOrganizations(experiences.filter((item) => item.end === undefined))

    return {
        "@context": "https://schema.org",
        "@type": "ProfilePage",
        url: buildAbsoluteUrl(ROUTES.about, language),
        inLanguage: language,
        dateModified: profile?.updatedAt,
        mainEntity: {
            "@type": "Person",
            "@id": buildPersonId(),
            name: labels.name,
            jobTitle: profile?.role,
            description: profile?.summary,
            image: profile?.photo
                ? `${getSiteUrl()}${publicUrl(profile.photo.large.src)}`
                : undefined,
            url: homeUrl,
            sameAs: orUndefined(sameAs),
            knowsAbout: orUndefined(knowsAbout),
            homeLocation: profile && {
                "@type": "Place",
                address: {
                    "@type": "PostalAddress",
                    addressLocality: profile.location.city,
                    addressRegion: profile.location.region,
                    addressCountry: profile.location.countryCode
                }
            },
            alumniOf: orUndefined(
                alumniOf.map((name) => ({ "@type": "EducationalOrganization", name }))
            ),
            worksFor: orUndefined(worksFor.map((name) => ({ "@type": "Organization", name }))),
            hasOccupation: orUndefined(
                experiences.map((item) => ({
                    "@type": "Occupation",
                    name: item.title,
                    description: item.summary
                }))
            ),
            hasCredential: orUndefined(
                (timeline?.certificates ?? []).map((certificate) => ({
                    "@type": "EducationalOccupationalCredential",
                    name: certificate.name
                }))
            )
        }
    }
}

export default buildAboutJsonLd
