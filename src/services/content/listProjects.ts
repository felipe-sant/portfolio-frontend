import buildProjectSummary from "@/services/content/buildProjectSummary"
import PROJECT_TYPES from "@/enum/projectTypes.enum"
import getProjectTechnologies from "@/services/content/getProjectTechnologies"
import normalizeSearchText from "@/services/content/normalizeSearchText"
import searchProjects from "@/services/content/searchProjects"
import sortProjects from "@/services/content/sortProjects"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type NormalizedProjectListParams from "@/types/project/NormalizedProjectListParams.types"
import type ProjectPage from "@/types/project/ProjectPage.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

function getYear(record: ProjectRecord): string {
    return record.date.slice(0, 4)
}

function hasEveryTechnology(
    record: ProjectRecord,
    technologies: string[],
    lang: SupportedLanguage
): boolean {
    const own = new Set(
        getProjectTechnologies(record.stack).map((name) => normalizeSearchText(name, lang))
    )

    return technologies.every((name) => own.has(normalizeSearchText(name, lang)))
}

function listAvailableTechnologies(records: ProjectRecord[], lang: SupportedLanguage): string[] {
    const byKey = new Map<string, string>()

    records.forEach((record) => {
        getProjectTechnologies(record.stack).forEach((name) => {
            const key = normalizeSearchText(name, lang)

            if (!byKey.has(key)) {
                byKey.set(key, name)
            }
        })
    })

    return [...byKey.values()].toSorted((first, second) => first.localeCompare(second, lang))
}

function listAvailableYears(records: ProjectRecord[]): string[] {
    return [...new Set(records.map(getYear))].toSorted().toReversed()
}

function listProjects(records: ProjectRecord[], params: NormalizedProjectListParams): ProjectPage {
    const { lang, q, type, category, tech, year, featured, sort, offset, limit } = params
    const matches = searchProjects(records, q, lang).filter(
        (project) =>
            (type === undefined || project.types.includes(type)) &&
            (category === undefined || project.category === category) &&
            (tech === undefined || hasEveryTechnology(project, tech, lang)) &&
            (year === undefined || year.includes(getYear(project))) &&
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
        ),
        availableTechnologies: listAvailableTechnologies(records, lang),
        availableYears: listAvailableYears(records)
    }
}

export default listProjects
