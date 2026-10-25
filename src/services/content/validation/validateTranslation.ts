import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import isRecord from "@/services/content/validation/isRecord"
import joinPath from "@/services/content/validation/joinPath"
import TRANSLATABLE_PATHS from "@/services/content/validation/translatablePaths"
import TRANSLATION_EXCEPTIONS from "@/services/content/validation/translationExceptions"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const REFERENCE_LANGUAGE = "pt-BR"
const OTHER_LANGUAGES = SUPPORTED_LANGUAGES.filter((lang) => lang !== REFERENCE_LANGUAGE)

type Position = { classPath: string; shownPath: string }

function isException(classPath: string, value: string): boolean {
    return (TRANSLATION_EXCEPTIONS[classPath] ?? []).includes(value)
}

function compare(
    reference: unknown,
    other: unknown,
    position: Position,
    translatable: string[],
    issues: ContentIssue[]
): void {
    const { classPath, shownPath } = position

    if (Array.isArray(reference) && Array.isArray(other)) {
        reference
            .slice(0, other.length)
            .forEach((item, index) =>
                compare(
                    item,
                    other[index],
                    { classPath: `${classPath}[]`, shownPath: `${shownPath}[${index}]` },
                    translatable,
                    issues
                )
            )
        return
    }

    if (isRecord(reference) && isRecord(other)) {
        for (const key of Object.keys(reference)) {
            if (key in other) {
                compare(
                    reference[key],
                    other[key],
                    {
                        classPath: classPath ? `${classPath}.${key}` : key,
                        shownPath: joinPath(shownPath, key)
                    },
                    translatable,
                    issues
                )
            }
        }
        return
    }

    if (
        typeof reference === "string" &&
        reference === other &&
        translatable.includes(classPath) &&
        !isException(classPath, reference)
    ) {
        issues.push({
            path: shownPath,
            message: `Texto igual ao de ${REFERENCE_LANGUAGE}, sem tradução: ${JSON.stringify(reference)}`
        })
    }
}

function documentPath(lang: SupportedLanguage, projectId: string, name: string): string {
    return `content/${lang}/projects/${projectId}/docs/${name}`
}

function sameBytes(first: Uint8Array, second: Uint8Array): boolean {
    return first.length === second.length && first.every((byte, index) => byte === second[index])
}

function validateDocumentTexts(
    snapshot: ContentSnapshot,
    lang: SupportedLanguage,
    issues: ContentIssue[]
): void {
    const projects = snapshot.languages[REFERENCE_LANGUAGE].projects ?? []

    for (const project of projects) {
        const documents = Array.isArray(project.documents) ? project.documents : []

        for (const document of documents) {
            if (!isRecord(document) || document.translated !== true) {
                continue
            }
            if (typeof document.name !== "string") {
                continue
            }

            const reference =
                snapshot.files[documentPath(REFERENCE_LANGUAGE, project.id, document.name)]
            const file = documentPath(lang, project.id, document.name)
            const other = snapshot.files[file]

            if (reference && other && sameBytes(reference, other)) {
                issues.push({
                    path: file,
                    message: `Documento igual ao de ${REFERENCE_LANGUAGE}, sem tradução`
                })
            }
        }
    }
}

function validateTranslation(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []
    const reference = snapshot.languages[REFERENCE_LANGUAGE]

    for (const lang of OTHER_LANGUAGES) {
        const other = snapshot.languages[lang]

        compare(
            reference.profile,
            other.profile,
            { classPath: "", shownPath: `content/${lang}/profile.json#` },
            TRANSLATABLE_PATHS.profile,
            issues
        )
        compare(
            reference.timeline,
            other.timeline,
            { classPath: "items", shownPath: `content/${lang}/timeline.json#items` },
            TRANSLATABLE_PATHS.timeline,
            issues
        )
        compare(
            reference.projects,
            other.projects,
            { classPath: "items", shownPath: `content/${lang}/projects.json#items` },
            TRANSLATABLE_PATHS.projects,
            issues
        )
        validateDocumentTexts(snapshot, lang, issues)
    }

    return issues
}

export default validateTranslation
