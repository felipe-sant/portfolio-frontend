import type ProjectMeta from "@/types/home/ProjectMeta.types"
import type ProjectSummary from "@/types/project/ProjectSummary.types"

function formatProjectMeta(project: ProjectSummary): ProjectMeta {
    return {
        types: project.types,
        category: project.category,
        year: project.date.slice(0, 4)
    }
}

export default formatProjectMeta
