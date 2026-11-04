import isRecord from "./isRecord"
import readContent from "./readContent"

function readRawProjects(language: string): Record<string, unknown>[] {
    const content = readContent(language, "projects")
    if (!isRecord(content) || !Array.isArray(content.items)) {
        throw new Error("projects.json sem items")
    }
    return content.items.map((item) => {
        if (!isRecord(item)) {
            throw new Error("projects.json com item inválido")
        }
        return item
    })
}

export default readRawProjects
