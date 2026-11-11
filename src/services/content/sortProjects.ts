import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"
import type ProjectSort from "@/types/project/ProjectSort.types"

type Comparator = (first: ProjectRecord, second: ProjectRecord) => number

function compareText(first: string, second: string): number {
    if (first === second) {
        return 0
    }
    return first < second ? -1 : 1
}

function byDateDescending(first: ProjectRecord, second: ProjectRecord): number {
    return compareText(second.date, first.date)
}

function byDateAscending(first: ProjectRecord, second: ProjectRecord): number {
    return compareText(first.date, second.date)
}

function byExperimentLast(first: ProjectRecord, second: ProjectRecord): number {
    return Number(first.experiment) - Number(second.experiment)
}

function byId(first: ProjectRecord, second: ProjectRecord): number {
    return compareText(first.id, second.id)
}

function sortProjects(
    projects: ProjectRecord[],
    sort: ProjectSort,
    lang: SupportedLanguage
): ProjectRecord[] {
    const collator = new Intl.Collator(lang, { sensitivity: "base", numeric: true })
    const byTitle: Comparator = (first, second) => collator.compare(first.title, second.title)
    const criteria: Comparator[] = {
        recent: [byExperimentLast, byDateDescending, byTitle, byId],
        oldest: [byExperimentLast, byDateAscending, byTitle, byId],
        title: [byExperimentLast, byTitle, byDateDescending, byId]
    }[sort]

    return projects.toSorted((first, second) => {
        for (const criterion of criteria) {
            const result = criterion(first, second)
            if (result !== 0) {
                return result
            }
        }
        return 0
    })
}

export default sortProjects
