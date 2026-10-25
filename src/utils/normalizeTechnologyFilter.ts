import toTechnologyKey from "@/utils/toTechnologyKey"

function normalizeTechnologyFilter(values: string[]): string[] {
    const byKey = new Map<string, string>()

    values.forEach((value) => {
        const key = toTechnologyKey(value)

        if (!byKey.has(key)) {
            byKey.set(key, value)
        }
    })

    return [...byKey.entries()]
        .toSorted(([first], [second]) => (first < second ? -1 : first > second ? 1 : 0))
        .map(([, value]) => value)
}

export default normalizeTechnologyFilter
