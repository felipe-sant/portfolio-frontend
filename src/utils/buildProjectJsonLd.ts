import ROUTES from "@/routers/paths"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import type JsonLdNode from "@/types/seo/JsonLdNode.types"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"
import getSiteUrl from "@/utils/getSiteUrl"
import publicUrl from "@/utils/publicUrl"

function buildProjectJsonLd(
    language: SupportedLanguage,
    project: ProjectDetail,
    genre: string[]
): JsonLdNode {
    const url = buildAbsoluteUrl(ROUTES.project, language, { id: project.id })
    const stackItems = project.stack.flatMap((group) => group.items)
    const programmingLanguages = stackItems
        .filter((item) => item.isProgrammingLanguage)
        .map((item) => item.name)
    const images = project.images.map((item) => `${getSiteUrl()}${publicUrl(item.large.src)}`)
    const hasRepository = Boolean(project.repositoryUrl)

    return {
        "@context": "https://schema.org",
        "@type": hasRepository ? "SoftwareSourceCode" : "CreativeWork",
        "@id": `${url}#project`,
        name: project.title,
        description: project.summary,
        url,
        inLanguage: language,
        author: { "@id": `${buildAbsoluteUrl(ROUTES.home, language)}#person` },
        dateCreated: project.date,
        dateModified: project.updatedAt,
        genre,
        keywords: stackItems.map((item) => item.name),
        image: images.length > 0 ? images : undefined,
        codeRepository: project.repositoryUrl,
        programmingLanguage:
            hasRepository && programmingLanguages.length > 0 ? programmingLanguages : undefined
    }
}

export default buildProjectJsonLd
