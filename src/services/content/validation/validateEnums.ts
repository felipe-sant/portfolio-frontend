import DOCUMENT_FORMATS from "@/services/content/documentFormats"
import PROJECT_CATEGORIES from "@/services/content/projectCategories"
import PROJECT_STATUSES from "@/services/content/projectStatuses"
import PROJECT_TYPES from "@/services/content/projectTypes"
import STACK_CATEGORIES from "@/services/content/stackCategories"
import TIMELINE_KINDS from "@/services/content/timelineKinds"
import isRecord from "@/services/content/validation/isRecord"
import listEntries from "@/services/content/validation/listEntries"
import requireList from "@/services/content/validation/requireList"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"

function checkEnum(
    options: readonly string[],
    value: unknown,
    path: string,
    issues: ContentIssue[]
): void {
    if (!options.some((option) => option === value)) {
        issues.push({
            path,
            message: `Valor fora do enum: ${JSON.stringify(value)}. Use ${options.join(", ")}`
        })
    }
}

function checkStackCategories(stack: unknown, path: string, issues: ContentIssue[]): void {
    requireList(stack, path, issues).forEach((group, index) => {
        if (isRecord(group)) {
            checkEnum(STACK_CATEGORIES, group.category, `${path}[${index}].category`, issues)
        }
    })
}

function validateEnums(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []

    for (const { path, record } of listEntries(snapshot, "projects")) {
        const types = requireList(record.types, `${path}.types`, issues)
        if (types.length === 0) {
            issues.push({ path: `${path}.types`, message: "Informe pelo menos um tipo" })
        }
        types.forEach((type, index) => {
            checkEnum(PROJECT_TYPES, type, `${path}.types[${index}]`, issues)
            if (types.indexOf(type) !== index) {
                issues.push({
                    path: `${path}.types[${index}]`,
                    message: `Tipo repetido: ${String(type)}`
                })
            }
        })
        checkEnum(PROJECT_CATEGORIES, record.category, `${path}.category`, issues)
        checkEnum(PROJECT_STATUSES, record.status, `${path}.status`, issues)
        checkStackCategories(record.stack, `${path}.stack`, issues)
        requireList(record.documents, `${path}.documents`, issues).forEach((document, index) => {
            if (isRecord(document)) {
                checkEnum(
                    DOCUMENT_FORMATS,
                    document.format,
                    `${path}.documents[${index}].format`,
                    issues
                )
            }
        })
    }

    for (const { path, record } of listEntries(snapshot, "timeline")) {
        checkEnum(TIMELINE_KINDS, record.kind, `${path}.kind`, issues)
    }

    for (const lang of SUPPORTED_LANGUAGES) {
        const profile = snapshot.languages[lang].profile
        if (profile) {
            checkStackCategories(profile.stack, `content/${lang}/profile.json#stack`, issues)
        }
    }

    return issues
}

export default validateEnums
