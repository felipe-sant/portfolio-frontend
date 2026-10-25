import type ProjectCategory from "@/types/project/ProjectCategory.types"
import type ProjectSort from "@/types/project/ProjectSort.types"
import type ProjectType from "@/types/project/ProjectType.types"

type ProjectsFilters = {
    q: string
    type?: ProjectType
    category?: ProjectCategory
    sort: ProjectSort
}

export default ProjectsFilters
