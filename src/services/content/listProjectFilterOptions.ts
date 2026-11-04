import getProjectTechnologies from "@/services/content/getProjectTechnologies"
import normalizeSearchText from "@/services/content/normalizeSearchText"
import type StackGroup from "@/types/content/StackGroup.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectFilterOption from "@/types/project/ProjectFilterOption.types"
import type ProjectFilterOptions from "@/types/project/ProjectFilterOptions.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

function listTechnologyOptions(
    records: ProjectRecord[],
    stack: StackGroup[],
    lang: SupportedLanguage
): ProjectFilterOption[] {
    const byKey = new Map<string, ProjectFilterOption>()

    function register(name: string) {
        const key = normalizeSearchText(name, lang)
        const existing = byKey.get(key)

        if (existing) {
            return existing
        }

        const created = { value: name, count: 0 }
        byKey.set(key, created)

        return created
    }

    getProjectTechnologies(stack).forEach(register)
    records.forEach((record) => {
        const keys = new Set(
            getProjectTechnologies(record.stack).map((name) => {
                register(name)

                return normalizeSearchText(name, lang)
            })
        )

        keys.forEach((key) => {
            const option = byKey.get(key)

            if (option) {
                option.count += 1
            }
        })
    })

    const collator = new Intl.Collator(lang, { sensitivity: "base" })

    return [...byKey.values()].toSorted((first, second) =>
        collator.compare(first.value, second.value)
    )
}

function listYearOptions(records: ProjectRecord[]): ProjectFilterOption[] {
    if (records.length === 0) {
        return []
    }

    const counts = new Map<number, number>()

    records.forEach((record) => {
        const year = Number(record.date.slice(0, 4))
        counts.set(year, (counts.get(year) ?? 0) + 1)
    })

    const years = [...counts.keys()]
    const first = Math.min(...years)
    const last = Math.max(...years)

    return Array.from({ length: last - first + 1 }, (_value, index) => last - index).map(
        (year) => ({ value: String(year), count: counts.get(year) ?? 0 })
    )
}

function listProjectFilterOptions(
    records: ProjectRecord[],
    stack: StackGroup[],
    lang: SupportedLanguage
): ProjectFilterOptions {
    return {
        technologies: listTechnologyOptions(records, stack, lang),
        years: listYearOptions(records)
    }
}

export default listProjectFilterOptions
