import ROUTES from "@/routers/paths"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectSummary from "@/types/project/ProjectSummary.types"
import type JsonLdNode from "@/types/seo/JsonLdNode.types"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"
import buildPersonId from "@/utils/buildPersonId"

type ProjectsJsonLdLabels = {
    title: string
    description: string
}

function buildProjectsJsonLd(
    language: SupportedLanguage,
    labels: ProjectsJsonLdLabels,
    projects: Pick<ProjectSummary, "id" | "title">[]
): JsonLdNode {
    return {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: labels.title,
        description: labels.description,
        url: buildAbsoluteUrl(ROUTES.projects, language),
        inLanguage: language,
        author: { "@id": buildPersonId() },
        mainEntity: {
            "@type": "ItemList",
            itemListElement: projects.map((project, index) => ({
                "@type": "ListItem",
                position: index + 1,
                url: buildAbsoluteUrl(`${ROUTES.projects}/:id`, language, { id: project.id }),
                name: project.title
            }))
        }
    }
}

export default buildProjectsJsonLd
