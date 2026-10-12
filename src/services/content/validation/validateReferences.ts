import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import isRecord from "@/services/content/validation/isRecord"
import requireList from "@/services/content/validation/requireList"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

function checkExists(id: unknown, ids: Set<unknown>, path: string, issues: ContentIssue[]): void {
    if (!ids.has(id)) {
        issues.push({ path, message: `Referência a projeto inexistente: ${JSON.stringify(id)}` })
    }
}

function validateReferences(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []

    for (const lang of SUPPORTED_LANGUAGES) {
        const projects = snapshot.languages[lang].projects ?? []
        const ids = new Set<unknown>(projects.map((project) => project.id))

        projects.forEach((project, index) => {
            const path = `content/${lang}/projects.json#items[${index}].related`
            const seen = new Set<unknown>()

            requireList(project.related, path, issues).forEach((related, position) => {
                if (!isRecord(related)) {
                    return
                }
                const relatedPath = `${path}[${position}].id`
                checkExists(related.id, ids, relatedPath, issues)
                if (related.id === project.id) {
                    issues.push({
                        path: relatedPath,
                        message: "O projeto não pode se relacionar consigo mesmo"
                    })
                }
                if (seen.has(related.id)) {
                    issues.push({
                        path: relatedPath,
                        message: `Relacionado repetido: ${String(related.id)}`
                    })
                }
                seen.add(related.id)
            })
        })

        snapshot.languages[lang].timeline?.forEach((item, index) => {
            const path = `content/${lang}/timeline.json#items[${index}].projectIds`
            const seen = new Set<unknown>()

            requireList(item.projectIds, path, issues).forEach((projectId, position) => {
                checkExists(projectId, ids, `${path}[${position}]`, issues)
                if (seen.has(projectId)) {
                    issues.push({
                        path: `${path}[${position}]`,
                        message: `Projeto repetido na trajetória: ${String(projectId)}`
                    })
                }
                seen.add(projectId)
            })
        })
    }

    return issues
}

export default validateReferences
