type Sortable = {
    id: string
    title: string
    date: string
}

type SortName = "recent" | "oldest" | "title"

function sortProjects<Project extends Sortable>(
    projects: Project[],
    sort: SortName,
    language: string
): Project[] {
    const collator = new Intl.Collator(language, { sensitivity: "base", numeric: true })
    const byId = (first: Project, second: Project) =>
        first.id < second.id ? -1 : Number(first.id > second.id)
    const byTitle = (first: Project, second: Project) => collator.compare(first.title, second.title)
    const byDate = (first: Project, second: Project) =>
        first.date < second.date ? -1 : Number(first.date > second.date)

    return projects.toSorted((first, second) => {
        if (sort === "title") {
            return byTitle(first, second) || -byDate(first, second) || byId(first, second)
        }
        const direction = sort === "recent" ? -1 : 1
        return direction * byDate(first, second) || byTitle(first, second) || byId(first, second)
    })
}

export default sortProjects
