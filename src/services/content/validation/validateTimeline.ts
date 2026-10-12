import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import checkObjectKeys from "@/services/content/validation/checkObjectKeys"
import requireList from "@/services/content/validation/requireList"
import requireText from "@/services/content/validation/requireText"
import validateStringList from "@/services/content/validation/validateStringList"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

const REQUIRED_KEYS = [
    "id",
    "kind",
    "title",
    "details",
    "start",
    "summary",
    "responsibilities",
    "disciplines",
    "technologies",
    "certificates",
    "projectIds"
]
const OPTIONAL_KEYS = ["organization", "stage", "end"]

function validateCertificates(certificates: unknown, path: string, issues: ContentIssue[]): void {
    requireList(certificates, path, issues).forEach((certificate, index) => {
        const certificatePath = `${path}[${index}]`

        if (checkObjectKeys(certificate, certificatePath, ["id", "name"], ["issuer"], issues)) {
            requireText(certificate, "name", certificatePath, issues)
            requireText(certificate, "issuer", certificatePath, issues)
        }
    })
}

function validateTimeline(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []

    for (const lang of SUPPORTED_LANGUAGES) {
        snapshot.languages[lang].timeline?.forEach((item, index) => {
            const path = `content/${lang}/timeline.json#items[${index}]`

            if (!checkObjectKeys(item, path, REQUIRED_KEYS, OPTIONAL_KEYS, issues)) {
                return
            }
            requireText(item, "title", path, issues)
            requireText(item, "summary", path, issues)
            requireText(item, "organization", path, issues)
            requireText(item, "stage", path, issues)

            const isExperience = item.kind === "experience"
            const needsOrganization = isExperience || item.kind === "education"

            if (needsOrganization && !("organization" in item)) {
                issues.push({
                    path: `${path}.organization`,
                    message: "A organização é obrigatória em experiência e formação"
                })
            }
            if (isExperience && "stage" in item) {
                issues.push({
                    path: `${path}.stage`,
                    message: "A etapa só vale em formação e curso"
                })
            }

            const responsibilities = validateStringList(
                item.responsibilities,
                `${path}.responsibilities`,
                issues
            )
            const disciplines = validateStringList(item.disciplines, `${path}.disciplines`, issues)
            if (!isExperience && responsibilities.length > 0) {
                issues.push({
                    path: `${path}.responsibilities`,
                    message: "As responsabilidades só valem em experiência"
                })
            }
            if (isExperience && disciplines.length > 0) {
                issues.push({
                    path: `${path}.disciplines`,
                    message: "As disciplinas só valem em formação e curso"
                })
            }
            validateStringList(item.details, `${path}.details`, issues)
            validateStringList(item.technologies, `${path}.technologies`, issues)
            validateStringList(item.projectIds, `${path}.projectIds`, issues)
            validateCertificates(item.certificates, `${path}.certificates`, issues)
        })
    }

    return issues
}

export default validateTimeline
