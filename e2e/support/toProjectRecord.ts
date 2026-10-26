import isRecord from "./isRecord"

function readText(record: Record<string, unknown>, key: string): string {
    const value = record[key]
    if (typeof value !== "string") {
        throw new Error(`projects.json com ${key} inválido`)
    }
    return value
}

function readTextList(value: unknown): string[] {
    return Array.isArray(value) ? value.filter((item) => typeof item === "string") : []
}

function readStackNames(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return []
    }
    const names = value.flatMap((group) =>
        isRecord(group) && Array.isArray(group.items)
            ? group.items.flatMap((item) =>
                  isRecord(item) && typeof item.name === "string" ? [item.name] : []
              )
            : []
    )
    return [...new Set(names)]
}

function toProjectRecord(item: Record<string, unknown>) {
    const date = readText(item, "date")
    return {
        id: readText(item, "id"),
        title: readText(item, "title"),
        date,
        year: date.slice(0, 4),
        types: readTextList(item.types),
        category: readText(item, "category"),
        featured: item.featured === true,
        technologies: readStackNames(item.stack),
        cardTechnologies: readTextList(item.cardTechnologies)
    }
}

export default toProjectRecord
