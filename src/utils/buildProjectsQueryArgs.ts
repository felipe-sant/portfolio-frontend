import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectsFilters from "@/types/project/ProjectsFilters.types"
import type ProjectsQueryArgs from "@/types/project/ProjectsQueryArgs.types"

function buildProjectsQueryArgs(
    lang: SupportedLanguage,
    { q, type, category, sort }: ProjectsFilters
): ProjectsQueryArgs {
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
