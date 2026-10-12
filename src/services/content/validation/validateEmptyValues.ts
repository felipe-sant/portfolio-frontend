import isRecord from "@/services/content/validation/isRecord"
import joinPath from "@/services/content/validation/joinPath"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

function collect(value: unknown, path: string, issues: ContentIssue[]): void {
    if (value === null) {
        issues.push({ path, message: "Campo opcional sem valor deve ser omitido, nunca null" })
    } else if (typeof value === "string") {
        if (value.trim() === "") {
            issues.push({ path, message: "Texto vazio: omita o campo opcional ou preencha" })
        }
    } else if (Array.isArray(value)) {
        value.forEach((item, index) => collect(item, `${path}[${index}]`, issues))
    } else if (isRecord(value)) {
        for (const [key, item] of Object.entries(value)) {
            collect(item, joinPath(path, key), issues)
        }
    }
}

function validateEmptyValues(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []

    for (const [lang, content] of Object.entries(snapshot.languages)) {
        collect(content.profile, `content/${lang}/profile.json#`, issues)
        collect(content.timeline, `content/${lang}/timeline.json#items`, issues)
        collect(content.projects, `content/${lang}/projects.json#items`, issues)
    }

    return issues
}

export default validateEmptyValues
