import ROUTES from "@/routers/paths"
import type StackItem from "@/types/content/StackItem.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import type JsonLdNode from "@/types/seo/JsonLdNode.types"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"
import buildPersonId from "@/utils/buildPersonId"
import getSiteUrl from "@/utils/getSiteUrl"
import publicUrl from "@/utils/publicUrl"

function uniqueNames(items: StackItem[]): string[] {
    return Array.from(new Set(items.map((item) => item.name)))
}

function orUndefined(list: string[]): string[] | undefined {
    return list.length > 0 ? list : undefined
}

function buildProjectJsonLd(
    language: SupportedLanguage,
    project: ProjectDetail,
    genre: string[]
): JsonLdNode {
    const url = buildAbsoluteUrl(ROUTES.project, language, { id: project.id })
    const stackItems = project.stack.flatMap((group) => group.items)
    const images = project.images.map((item) => `${getSiteUrl()}${publicUrl(item.large.src)}`)
    const hasRepository = Boolean(project.repositoryUrl)
    const programmingLanguages = hasRepository
        ? uniqueNames(stackItems.filter((item) => item.isProgrammingLanguage))
        : []
    const keywords = uniqueNames(stackItems).filter((name) => !programmingLanguages.includes(name))

    return {
        "@context": "https://schema.org",
        "@type": hasRepository ? "SoftwareSourceCode" : "CreativeWork",
        "@id": `${url}#project`,
        name: project.title,
        description: project.summary,
        url,
        inLanguage: language,
        author: { "@id": buildPersonId() },
        dateCreated: project.date,
        dateModified: project.updatedAt,
        genre,
        keywords: orUndefined(keywords),
        image: images.length > 0 ? images : undefined,
        codeRepository: project.repositoryUrl,
        programmingLanguage: orUndefined(programmingLanguages)
    }
}

export default buildProjectJsonLd
