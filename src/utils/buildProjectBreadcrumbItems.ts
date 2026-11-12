import ROUTES from "@/routers/paths"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import type BreadcrumbItem from "@/types/seo/BreadcrumbItem.types"

type ProjectBreadcrumbLabels = {
    home: string
    projects: string
}

function buildProjectBreadcrumbItems(
    labels: ProjectBreadcrumbLabels,
    project: ProjectDetail,
    documentName?: string
): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [
        { name: labels.home, path: ROUTES.home },
        { name: labels.projects, path: ROUTES.projects },
        { name: project.title, path: ROUTES.project, params: { id: project.id } }
    ]

    if (documentName !== undefined) {
        items.push({
            name: documentName,
            path: ROUTES.projectDocument,
            params: { id: project.id, name: documentName }
        })
    }

    return items
}

export default buildProjectBreadcrumbItems
