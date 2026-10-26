import defaultProjectSort from "@/utils/defaultProjectSort"
import normalizeTechnologyFilter from "@/utils/normalizeTechnologyFilter"
import normalizeYearFilter from "@/utils/normalizeYearFilter"
import type ProjectsFilters from "@/types/project/ProjectsFilters.types"

function buildProjectsSearch({ q, type, category, tech, year, sort }: ProjectsFilters): string {
    const params = new URLSearchParams()

    if (q !== "") {
        params.set("q", q)
    }

    if (type) {
        params.set("type", type)
    }

    if (category) {
        params.set("category", category)
    }

    normalizeTechnologyFilter(tech ?? []).forEach((value) => params.append("tech", value))
    normalizeYearFilter(year ?? []).forEach((value) => params.append("year", value))

    if (sort !== defaultProjectSort) {
        params.set("sort", sort)
    }

    const search = params.toString()

    return search === "" ? "" : `?${search}`
}

export default buildProjectsSearch
