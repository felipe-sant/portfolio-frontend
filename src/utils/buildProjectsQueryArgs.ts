import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectListParams from "@/types/project/ProjectListParams.types"
import type ProjectsFilters from "@/types/project/ProjectsFilters.types"

function buildProjectsQueryArgs(
    lang: SupportedLanguage,
    { q, type, category, sort }: ProjectsFilters
): Omit<ProjectListParams, "offset" | "limit"> {
    const query = q.trim()

    return {
        lang,
        ...(query !== "" && { q: query }),
        ...(type && { type }),
        ...(category && { category }),
        ...(sort !== "recent" && { sort })
    }
}

export default buildProjectsQueryArgs
