import type ProjectsFilters from "@/types/project/ProjectsFilters.types"

function hasProjectsFilters({ q, type, category, tech, year }: ProjectsFilters): boolean {
    return (
        q !== "" ||
        type !== undefined ||
        category !== undefined ||
        (tech?.length ?? 0) > 0 ||
        (year?.length ?? 0) > 0
    )
}

export default hasProjectsFilters
