import isRecord from "./isRecord"
import readContent from "./readContent"

type ContactChannels = {
    email: string
    location: string
    locationDetail: string
    responseLabel: string
    responseDetail: string
    availabilityLabel: string
}

function readText(source: Record<string, unknown>, key: string): string {
    const value = source[key]

    if (typeof value !== "string") {
        throw new Error(`profile.json sem o texto ${key}`)
    }

    return value
}

function readRecord(source: Record<string, unknown>, key: string): Record<string, unknown> {
    const value = source[key]

    if (!isRecord(value)) {
        throw new Error(`profile.json sem o objeto ${key}`)
    }

    return value
}

function readContactChannels(language: string): ContactChannels {
    const content = readContent(language, "profile")

    if (!isRecord(content)) {
        throw new Error("profile.json inválido")
    }

    const contact = readRecord(content, "contact")
    const responseTime = readRecord(contact, "responseTime")
    const location = readRecord(content, "location")
    const availability = readRecord(content, "availability")

    return {
        email: readText(contact, "email"),
        location: `${readText(location, "city")} · ${readText(location, "region")}`,
        locationDetail: readText(location, "detail"),
        responseLabel: readText(responseTime, "label"),
        responseDetail: readText(responseTime, "detail"),
        availabilityLabel: readText(availability, "label")
    }
}

export default readContactChannels
