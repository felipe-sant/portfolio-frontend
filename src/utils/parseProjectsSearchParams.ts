import PROJECT_CATEGORIES from "@/enum/projectCategories.enum"
import PROJECT_SORTS from "@/enum/projectSorts.enum"
import PROJECT_TYPES from "@/enum/projectTypes.enum"
import defaultProjectSort from "@/utils/defaultProjectSort"
import normalizeTechnologyFilter from "@/utils/normalizeTechnologyFilter"
import normalizeYearFilter from "@/utils/normalizeYearFilter"
import type ProjectsFilters from "@/types/project/ProjectsFilters.types"

const MAX_QUERY_LENGTH = 100
const MAX_FILTER_VALUES = 10
const YEAR_PATTERN = /^\d{4}$/

function pickOption<T extends string>(options: readonly T[], value: string | null): T | undefined {
    return options.find((option) => option === value)
}

function pickTechnologies(values: string[]): string[] {
    return normalizeTechnologyFilter(
        values
            .map((value) => value.trim())
            .filter((value) => value !== "" && value.length <= MAX_QUERY_LENGTH)
            .slice(0, MAX_FILTER_VALUES)
    )
}

function pickYears(values: string[]): string[] {
    return normalizeYearFilter(
        values.filter((value) => YEAR_PATTERN.test(value)).slice(0, MAX_FILTER_VALUES)
    )
}

function parseProjectsSearchParams(searchParams: URLSearchParams): ProjectsFilters {
    const type = pickOption(PROJECT_TYPES, searchParams.get("type"))
    const category = pickOption(PROJECT_CATEGORIES, searchParams.get("category"))
    const sort = pickOption(PROJECT_SORTS, searchParams.get("sort")) ?? defaultProjectSort
    const q = (searchParams.get("q") ?? "").slice(0, MAX_QUERY_LENGTH).trim()
    const tech = pickTechnologies(searchParams.getAll("tech"))
    const year = pickYears(searchParams.getAll("year"))

    return {
        q,
        ...(type && { type }),
        ...(category && { category }),
        ...(tech.length > 0 && { tech }),
        ...(year.length > 0 && { year }),
        sort
    }
}

export default parseProjectsSearchParams
