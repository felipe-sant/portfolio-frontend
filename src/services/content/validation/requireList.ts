import type ContentIssue from "@/types/content/ContentIssue.types"

function requireList(value: unknown, path: string, issues: ContentIssue[]): unknown[] {
    if (Array.isArray(value)) {
        return value
    }

    issues.push({ path, message: "Deve ser uma lista" })
    return []
}

export default requireList
