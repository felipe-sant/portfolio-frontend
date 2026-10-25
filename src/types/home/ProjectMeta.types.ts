import type ProjectCategory from "@/types/project/ProjectCategory.types"
import type ProjectType from "@/types/project/ProjectType.types"

type ProjectMeta = {
    types: ProjectType[]
    category: ProjectCategory
    year: string
}

export default ProjectMeta
