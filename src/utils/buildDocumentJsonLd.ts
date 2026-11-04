import ROUTES from "@/routers/paths"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import type JsonLdNode from "@/types/seo/JsonLdNode.types"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"

function buildDocumentJsonLd(
    language: SupportedLanguage,
    project: ProjectDetail,
    document: ProjectDocument
): JsonLdNode {
    const projectUrl = buildAbsoluteUrl(ROUTES.project, language, { id: project.id })

    return {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: `${document.name} · ${project.title}`,
        url: buildAbsoluteUrl(ROUTES.projectDocument, language, {
            id: project.id,
            name: document.name
        }),
        inLanguage: document.translated ? language : (document.contentLanguage ?? language),
        author: { "@id": `${buildAbsoluteUrl(ROUTES.home, language)}#person` },
        dateModified: document.updatedAt,
        about: { "@id": `${projectUrl}#project` }
    }
}

export default buildDocumentJsonLd
