import isRecord from "./isRecord"
import readContent from "./readContent"

type TimelineKind = "experience" | "education" | "course"

type TimelineEntry = {
    kind: TimelineKind
    title: string
    organization: string
    summary: string
    highlight: string
    isCurrent: boolean
}

type About = {
    summary: string
    role: string
    mode: string
    github: string
    linkedin: string
    location: string
    aboutParagraphs: string[]
    workPrinciples: string[]
    stackCounts: number[]
    entries: TimelineEntry[]
}

function readText(source: Record<string, unknown>, key: string): string {
    const value = source[key]

    if (typeof value !== "string") {
        throw new Error(`conteúdo sem o texto ${key}`)
    }

    return value
}

function readTexts(source: Record<string, unknown>, key: string): string[] {
    const value = source[key]

    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
        throw new Error(`conteúdo sem a lista ${key}`)
    }

    return value
}

function readRecordList(source: Record<string, unknown>, key: string) {
    const value = source[key]

    if (!Array.isArray(value) || !value.every(isRecord)) {
        throw new Error(`conteúdo sem a lista ${key}`)
    }

    return value
}

function readKind(value: string): TimelineKind {
    if (value !== "experience" && value !== "education" && value !== "course") {
        throw new Error(`tipo de trajetória desconhecido ${value}`)
    }

    return value
}

function readAbout(language: string): About {
    const profile = readContent(language, "profile")
    const timeline = readContent(language, "timeline")

    if (!isRecord(profile) || !isRecord(timeline) || !isRecord(profile.location)) {
        throw new Error("perfil ou trajetória inválidos")
    }

    const links = profile.links

    if (!isRecord(links)) {
        throw new Error("perfil sem links")
    }

    const entries = readRecordList(timeline, "items").map((item) => {
        const kind = readKind(readText(item, "kind"))
        const title = readText(item, "title")
        const organization = readText(item, "organization")

        return {
            kind,
            title,
            organization,
            summary: readText(item, "summary"),
            highlight: kind === "education" ? organization : title,
            isCurrent: item.end === undefined
        }
    })

    return {
        summary: readText(profile, "summary"),
        role: readText(profile, "role"),
        mode: readText(profile.location, "detail"),
        github: readText(links, "github"),
        linkedin: readText(links, "linkedin"),
        location: `${readText(profile.location, "city")} · ${readText(profile.location, "region")}`,
        aboutParagraphs: readTexts(profile, "aboutParagraphs"),
        workPrinciples: readTexts(profile, "workPrinciples"),
        stackCounts: readRecordList(profile, "stack").map(
            (group) => readRecordList(group, "items").length
        ),
        entries
    }
}

export default readAbout
