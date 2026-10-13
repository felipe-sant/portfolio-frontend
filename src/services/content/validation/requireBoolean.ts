import joinPath from "@/services/content/validation/joinPath"
import type ContentIssue from "@/types/content/ContentIssue.types"

function requireBoolean(
    record: Record<string, unknown>,
    key: string,
    path: string,
    issues: ContentIssue[]
): void {
    if (key in record && typeof record[key] !== "boolean") {
        issues.push({ path: joinPath(path, key), message: "Deve ser verdadeiro ou falso" })
    }
}

export default requireBoolean
