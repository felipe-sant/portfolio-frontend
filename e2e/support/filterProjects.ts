import type readProjects from "./readProjects"

type Project = ReturnType<typeof readProjects>[number]

type Filters = {
    q?: string
    type?: string
    category?: string
    tech?: string[]
    year?: string[]
}

function normalize(value: string): string {
    return value
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
}

function matchesSearch(project: Project, query: string): boolean {
    const haystacks = [project.title, ...project.technologies].map(normalize)
    return normalize(query)
        .split(" ")
        .filter((word) => word !== "")
        .every((word) => haystacks.some((text) => text.includes(word)))
}

function filterProjects(projects: Project[], filters: Filters): Project[] {
    const { q = "", type, category, tech = [], year = [] } = filters
    return projects.filter(
        (project) =>
            matchesSearch(project, q) &&
            (type === undefined || project.types.includes(type)) &&
            (category === undefined || project.category === category) &&
            tech.every((name) => project.technologies.includes(name)) &&
            (year.length === 0 || year.includes(project.year))
    )
}

export default filterProjects
