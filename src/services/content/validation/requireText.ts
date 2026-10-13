import isNonEmptyString from "@/services/content/validation/isNonEmptyString"
import joinPath from "@/services/content/validation/joinPath"
import type ContentIssue from "@/types/content/ContentIssue.types"

function requireText(
    record: Record<string, unknown>,
    key: string,
    path: string,
    issues: ContentIssue[],
    maxLength?: number
): void {
    if (!(key in record)) {
        return
    }

    const value = record[key]

    if (!isNonEmptyString(value)) {
        issues.push({ path: joinPath(path, key), message: "Deve ser um texto não vazio" })
    } else if (maxLength !== undefined && value.length > maxLength) {
        issues.push({
            path: joinPath(path, key),
            message: `Texto com ${value.length} caracteres; o limite é ${maxLength}`
        })
    }
}

export default requireText
