import type ProjectSummary from "@/types/project/ProjectSummary.types"
import type ProjectType from "@/types/project/ProjectType.types"

type ProjectPage = {
    items: ProjectSummary[]
    total: number
    offset: number
    limit: number
    availableTypes: ProjectType[]
}

export default ProjectPage
