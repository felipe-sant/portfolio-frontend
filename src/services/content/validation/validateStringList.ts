import isNonEmptyString from "@/services/content/validation/isNonEmptyString"
import requireList from "@/services/content/validation/requireList"
import type ContentIssue from "@/types/content/ContentIssue.types"

function validateStringList(value: unknown, path: string, issues: ContentIssue[]): string[] {
    const items = requireList(value, path, issues)

    items.forEach((item, index) => {
        if (!isNonEmptyString(item)) {
            issues.push({ path: `${path}[${index}]`, message: "Deve ser um texto não vazio" })
        }
    })

    return items.filter(isNonEmptyString)
}

export default validateStringList
