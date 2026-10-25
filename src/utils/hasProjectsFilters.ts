import type ProjectsFilters from "@/types/project/ProjectsFilters.types"

function hasProjectsFilters({ q, type, category }: ProjectsFilters): boolean {
    return q !== "" || type !== undefined || category !== undefined
}

export default hasProjectsFilters
