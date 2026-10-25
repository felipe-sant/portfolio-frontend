import type ProjectsFilters from "@/types/project/ProjectsFilters.types"

function buildProjectsSearch({ q, type, category, sort }: ProjectsFilters): string {
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

    if (sort !== "recent") {
        params.set("sort", sort)
    }

    const search = params.toString()

    return search === "" ? "" : `?${search}`
}

export default buildProjectsSearch
