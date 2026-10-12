import STACK_CATEGORIES from "@/enum/stackCategories.enum"
import checkObjectKeys from "@/services/content/validation/checkObjectKeys"
import isNonEmptyString from "@/services/content/validation/isNonEmptyString"
import requireBoolean from "@/services/content/validation/requireBoolean"
import requireList from "@/services/content/validation/requireList"
import type ContentIssue from "@/types/content/ContentIssue.types"

function categoryRank(category: string): number {
    return STACK_CATEGORIES.findIndex((item) => item === category)
}

function validateItems(items: unknown, path: string, issues: ContentIssue[]): void {
    const seen = new Set<string>()

    requireList(items, path, issues).forEach((item, index) => {
        const itemPath = `${path}[${index}]`

        if (
            !checkObjectKeys(
                item,
                itemPath,
                ["name"],
                ["isPrimary", "isProgrammingLanguage"],
                issues
            )
        ) {
            return
        }
        if ("name" in item && !isNonEmptyString(item.name)) {
            issues.push({ path: `${itemPath}.name`, message: "Deve ser um texto não vazio" })
        } else if (typeof item.name === "string") {
            if (seen.has(item.name)) {
                issues.push({
                    path: `${itemPath}.name`,
                    message: `Tecnologia repetida no grupo: ${item.name}`
                })
            }
            seen.add(item.name)
        }
        requireBoolean(item, "isPrimary", itemPath, issues)
        requireBoolean(item, "isProgrammingLanguage", itemPath, issues)
    })
}

function validateStack(
    stack: unknown,
    path: string,
    minGroups: number,
    issues: ContentIssue[]
): void {
    const groups = requireList(stack, path, issues)
    const seen: string[] = []

    if (groups.length < minGroups) {
        issues.push({ path, message: `A stack precisa de pelo menos ${minGroups} grupo` })
    }

    groups.forEach((group, index) => {
        const groupPath = `${path}[${index}]`

        if (!checkObjectKeys(group, groupPath, ["category", "items"], [], issues)) {
            return
        }
        if (Array.isArray(group.items) && group.items.length === 0) {
            issues.push({
                path: `${groupPath}.items`,
                message: "O grupo precisa de pelo menos um item"
            })
        }
        validateItems(group.items, `${groupPath}.items`, issues)

        const category = String(group.category)
        const rank = categoryRank(category)
        if (seen.includes(category)) {
            issues.push({
                path: `${groupPath}.category`,
                message: `Categoria repetida: ${category}`
            })
        }
        if (rank >= 0 && seen.some((previous) => categoryRank(previous) > rank)) {
            issues.push({
                path: `${groupPath}.category`,
                message: `Grupos fora da ordem do enum (${STACK_CATEGORIES.join(", ")})`
            })
        }
        seen.push(category)
    })
}

export default validateStack
