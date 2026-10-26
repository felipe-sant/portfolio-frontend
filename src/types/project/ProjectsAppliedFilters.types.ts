import type ProjectSort from "@/types/project/ProjectSort.types"

type ProjectsAppliedFilters = {
    tech: string[]
    year: string[]
    sort: ProjectSort
}

export default ProjectsAppliedFilters
