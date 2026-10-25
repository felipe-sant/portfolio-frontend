import PROJECT_CATEGORIES from "@/enum/projectCategories.enum"
import PROJECT_SORTS from "@/enum/projectSorts.enum"
import PROJECT_TYPES from "@/enum/projectTypes.enum"
import type ProjectsFilters from "@/types/project/ProjectsFilters.types"

const MAX_QUERY_LENGTH = 100

function pickOption<T extends string>(options: readonly T[], value: string | null): T | undefined {
    return options.find((option) => option === value)
}

function parseProjectsSearchParams(searchParams: URLSearchParams): ProjectsFilters {
    const type = pickOption(PROJECT_TYPES, searchParams.get("type"))
    const category = pickOption(PROJECT_CATEGORIES, searchParams.get("category"))
    const sort = pickOption(PROJECT_SORTS, searchParams.get("sort")) ?? "recent"
    const q = (searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH).trim()

    return {
        q,
        ...(type && { type }),
        ...(category && { category }),
        sort
    }
}

export default parseProjectsSearchParams
