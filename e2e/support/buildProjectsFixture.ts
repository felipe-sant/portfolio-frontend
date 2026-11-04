import readRawProjects from "./readRawProjects"
import toProjectRecord from "./toProjectRecord"

const EXTRA_STACKS = [
    ["React", "Docker"],
    ["Node.js", "Redis"],
    ["React", "Redis"],
    ["Python", "Docker"]
]
const FIRST_EXTRA_YEAR = 2018
const YEAR_SPAN = 6

function buildProjectsFixture(language: string, count: number) {
    const base = readRawProjects(language)
    const items = Array.from({ length: count }, (_value, index) => {
        const original = base[index % base.length]
        if (index < base.length) {
            return original
        }
        const names = EXTRA_STACKS[index % EXTRA_STACKS.length]
        const year = FIRST_EXTRA_YEAR + (index % YEAR_SPAN)
        const id = `${String(original.id).slice(0, -4)}${index.toString(16).padStart(4, "0")}`
        return {
            ...original,
            id,
            title: `${String(original.title)} ${index + 1}`,
            date: `${year}-06`,
            stack: [{ category: "frontend", items: names.map((name) => ({ name })) }],
            cardTechnologies: names,
            featured: false
        }
    })

    return {
        body: JSON.stringify({ items }),
        projects: items.map(toProjectRecord)
    }
}

export default buildProjectsFixture
