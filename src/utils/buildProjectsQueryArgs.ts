import normalizeTechnologyFilter from "@/utils/normalizeTechnologyFilter"
import normalizeYearFilter from "@/utils/normalizeYearFilter"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectsFilters from "@/types/project/ProjectsFilters.types"
import type ProjectsQueryArgs from "@/types/project/ProjectsQueryArgs.types"

function buildProjectsQueryArgs(
    lang: SupportedLanguage,
    { q, type, category, tech, year, sort }: ProjectsFilters
): ProjectsQueryArgs {
    const query = q.trim()
    const technologies = normalizeTechnologyFilter(tech ?? [])
    const years = normalizeYearFilter(year ?? [])

    return {
        lang,
        ...(query !== "" && { q: query }),
        ...(type && { type }),
        ...(category && { category }),
        ...(technologies.length > 0 && { tech: technologies }),
        ...(years.length > 0 && { year: years }),
        ...(sort !== "recent" && { sort })
    }
}

export default buildProjectsQueryArgs
