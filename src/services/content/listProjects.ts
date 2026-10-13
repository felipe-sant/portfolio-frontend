import buildProjectSummary from "@/services/content/buildProjectSummary"
import PROJECT_TYPES from "@/enum/projectTypes.enum"
import searchProjects from "@/services/content/searchProjects"
import sortProjects from "@/services/content/sortProjects"
import type NormalizedProjectListParams from "@/types/project/NormalizedProjectListParams.types"
import type ProjectPage from "@/types/project/ProjectPage.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

function listProjects(records: ProjectRecord[], params: NormalizedProjectListParams): ProjectPage {
    const { lang, q, type, category, featured, sort, offset, limit } = params
    const matches = searchProjects(records, q, lang).filter(
        (project) =>
            (type === undefined || project.types.includes(type)) &&
            (category === undefined || project.category === category) &&
            (!featured || project.featured)
    )
    const sorted = sortProjects(matches, sort, lang)

    return {
        items: sorted.slice(offset, offset + limit).map(buildProjectSummary),
        total: sorted.length,
        offset,
        limit,
        availableTypes: PROJECT_TYPES.filter((projectType) =>
            records.some((record) => record.types.includes(projectType))
        )
    }
}

export default listProjects
