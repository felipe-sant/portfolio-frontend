import readContent from "./readContent"

type Profile = {
    email: string
    github: string
    linkedin: string
    availabilityLabel: string
    homeIntro: string
    stack: string[]
}

type UnknownRecord = Record<string, unknown>

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readRecord(source: UnknownRecord, key: string): UnknownRecord {
    const value = source[key]

    if (!isRecord(value)) {
        throw new Error(`profile.json sem o objeto ${key}`)
    }

    return value
}

function readText(source: UnknownRecord, key: string): string {
    const value = source[key]

    if (typeof value !== "string") {
        throw new Error(`profile.json sem o texto ${key}`)
    }

    return value
}

function readStack(source: UnknownRecord): string[] {
    const groups = source.stack

    if (!Array.isArray(groups)) {
        throw new Error("profile.json sem stack")
    }

    return groups.flatMap((group) => {
        if (!isRecord(group) || !Array.isArray(group.items)) {
            throw new Error("profile.json com grupo de stack inválido")
        }

        return group.items.map((item) => {
            if (!isRecord(item)) {
                throw new Error("profile.json com item de stack inválido")
            }

            return readText(item, "name")
        })
    })
}

function readProfile(language: string): Profile {
    const content = readContent(language, "profile")

    if (!isRecord(content)) {
        throw new Error("profile.json inválido")
    }

    const contact = readRecord(content, "contact")
    const links = readRecord(content, "links")
    const availability = readRecord(content, "availability")

    return {
        email: readText(contact, "email"),
        github: readText(links, "github"),
        linkedin: readText(links, "linkedin"),
        availabilityLabel: readText(availability, "label"),
        homeIntro: readText(content, "homeIntro"),
        stack: readStack(content)
    }
}

export default readProfile
