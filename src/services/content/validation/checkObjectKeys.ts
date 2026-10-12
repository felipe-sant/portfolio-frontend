import isRecord from "@/services/content/validation/isRecord"
import joinPath from "@/services/content/validation/joinPath"
import type ContentIssue from "@/types/content/ContentIssue.types"

function checkObjectKeys(
    value: unknown,
    path: string,
    required: string[],
    optional: string[],
    issues: ContentIssue[]
): value is Record<string, unknown> {
    if (!isRecord(value)) {
        issues.push({ path, message: "Deve ser um objeto" })
        return false
    }

    for (const key of required) {
        if (!(key in value)) {
            issues.push({ path: joinPath(path, key), message: "Campo obrigatório ausente" })
        }
    }

    for (const key of Object.keys(value)) {
        if (!required.includes(key) && !optional.includes(key)) {
            issues.push({ path: joinPath(path, key), message: "Campo desconhecido" })
        }
    }

    return true
}

export default checkObjectKeys
