import readContent from "./readContent"

type FeaturedProject = {
    id: string
    title: string
}

const FEATURED_LIMIT = 4

function readFeaturedProjects(language: string): FeaturedProject[] {
    const content = readContent(language, "projects")

    if (typeof content !== "object" || content === null || !("items" in content)) {
        throw new Error("projects.json sem items")
    }

    if (!Array.isArray(content.items)) {
        throw new Error("projects.json com items inválido")
    }

    const records = content.items.flatMap((item: unknown) => {
        if (
            typeof item === "object" &&
            item !== null &&
            "id" in item &&
            "title" in item &&
            "date" in item &&
            "featured" in item &&
            typeof item.id === "string" &&
            typeof item.title === "string" &&
            typeof item.date === "string" &&
            item.featured === true
        ) {
            return [{ id: item.id, title: item.title, date: item.date }]
        }

        return []
    })

    return records
        .toSorted((first, second) => {
            if (first.date !== second.date) {
                return first.date < second.date ? 1 : -1
            }
            const collator = new Intl.Collator(language, { sensitivity: "base", numeric: true })
            return (
                collator.compare(first.title, second.title) ||
                (first.id < second.id ? -1 : Number(first.id > second.id))
            )
        })
        .slice(0, FEATURED_LIMIT)
        .map(({ id, title }) => ({ id, title }))
}

export default readFeaturedProjects
