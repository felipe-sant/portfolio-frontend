import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import isRecord from "@/services/content/validation/isRecord"
import isValidDay from "@/services/content/validation/isValidDay"
import isValidMonth from "@/services/content/validation/isValidMonth"
import requireList from "@/services/content/validation/requireList"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

const README_NAME = "README.md"

function checkMonth(value: unknown, path: string, issues: ContentIssue[]): void {
    if (!isValidMonth(value)) {
        issues.push({ path, message: `Data fora do formato AAAA-MM: ${JSON.stringify(value)}` })
    }
}

function checkDay(value: unknown, path: string, issues: ContentIssue[]): void {
    if (!isValidDay(value)) {
        issues.push({ path, message: `Data fora do formato AAAA-MM-DD: ${JSON.stringify(value)}` })
    }
}

function checkRequiredDay(owner: object, path: string, issues: ContentIssue[]): void {
    if (!("updatedAt" in owner)) {
        issues.push({ path, message: "Campo obrigatório ausente" })
        return
    }

    checkDay(owner.updatedAt, path, issues)
}

function validateDates(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []

    for (const lang of SUPPORTED_LANGUAGES) {
        const profile = snapshot.languages[lang].profile

        if (isRecord(profile) && "updatedAt" in profile) {
            checkDay(profile.updatedAt, `content/${lang}/profile.json#updatedAt`, issues)
        }

        snapshot.languages[lang].projects?.forEach((project, index) => {
            const path = `content/${lang}/projects.json#items[${index}]`

            checkMonth(project.date, `${path}.date`, issues)
            checkRequiredDay(project, `${path}.updatedAt`, issues)
            requireList(project.documents, `${path}.documents`, issues).forEach(
                (document, position) => {
                    if (isRecord(document) && document.name !== README_NAME) {
                        checkRequiredDay(
                            document,
                            `${path}.documents[${position}].updatedAt`,
                            issues
                        )
                    } else if (isRecord(document) && "updatedAt" in document) {
                        checkDay(
                            document.updatedAt,
                            `${path}.documents[${position}].updatedAt`,
                            issues
                        )
                    }
                }
            )
        })

        snapshot.languages[lang].timeline?.forEach((item, index) => {
            const path = `content/${lang}/timeline.json#items[${index}]`

            checkMonth(item.start, `${path}.start`, issues)
            if ("end" in item) {
                checkMonth(item.end, `${path}.end`, issues)
            }
            if (isValidMonth(item.start) && isValidMonth(item.end) && item.end < item.start) {
                issues.push({
                    path: `${path}.end`,
                    message: "O fim não pode ser anterior ao início"
                })
            }
        })
    }

    return issues
}

export default validateDates
