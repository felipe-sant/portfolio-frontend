import getProjectTechnologies from "@/services/content/getProjectTechnologies"
import normalizeSearchText from "@/services/content/normalizeSearchText"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

function searchProjects(
    projects: ProjectRecord[],
    query: string | undefined,
    lang: SupportedLanguage
): ProjectRecord[] {
    const words = normalizeSearchText(query ?? "", lang)
        .split(/\s+/)
        .filter((word) => word.length > 0)

    if (words.length === 0) {
        return projects
    }

    return projects.filter((project) => {
        const fields = [project.title, ...getProjectTechnologies(project.stack)].map((field) =>
            normalizeSearchText(field, lang)
        )

        return words.every((word) => fields.some((field) => field.includes(word)))
    })
}

export default searchProjects
