function normalizeYearFilter(values: string[]): string[] {
    return [...new Set(values)].toSorted()
}

export default normalizeYearFilter
