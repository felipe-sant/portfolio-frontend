import isRecord from "./isRecord"
import readContent from "./readContent"

function readProfileUpdatedAt(language: string): string {
    const content = readContent(language, "profile")

    if (!isRecord(content) || typeof content.updatedAt !== "string") {
        throw new Error("profile.json sem updatedAt")
    }

    return content.updatedAt
}

export default readProfileUpdatedAt
