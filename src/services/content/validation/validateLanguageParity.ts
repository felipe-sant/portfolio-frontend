import isRecord from "@/services/content/validation/isRecord"
import joinPath from "@/services/content/validation/joinPath"
import TRANSLATABLE_PATHS from "@/services/content/validation/translatablePaths"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const REFERENCE_LANGUAGE = "pt-BR"
const OTHER_LANGUAGES: SupportedLanguage[] = ["en", "es"]

type Position = { classPath: string; shownPath: string }

function compare(
    reference: unknown,
    other: unknown,
    position: Position,
    translatable: string[],
    issues: ContentIssue[]
): void {
    const { classPath, shownPath } = position

    if (Array.isArray(reference) && Array.isArray(other)) {
        if (reference.length !== other.length) {
            issues.push({
                path: shownPath,
                message: `Lista com ${other.length} itens, mas ${REFERENCE_LANGUAGE} tem ${reference.length}`
            })
            return
        }
        reference.forEach((item, index) =>
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
        for (const key of new Set([...Object.keys(reference), ...Object.keys(other)])) {
            const childPath = {
                classPath: classPath ? `${classPath}.${key}` : key,
                shownPath: joinPath(shownPath, key)
            }
            if (!(key in reference) || !(key in other)) {
                issues.push({
                    path: childPath.shownPath,
                    message: `Campo presente em só um dos idiomas (${REFERENCE_LANGUAGE} ${key in reference ? "tem" : "não tem"})`
                })
            } else {
                compare(reference[key], other[key], childPath, translatable, issues)
            }
        }
        return
    }

    if (typeof reference !== typeof other || Array.isArray(reference) !== Array.isArray(other)) {
        issues.push({ path: shownPath, message: `Tipo diferente de ${REFERENCE_LANGUAGE}` })
        return
    }

    if (!translatable.includes(classPath) && reference !== other) {
        issues.push({
            path: shownPath,
            message: `Valor neutro diferente de ${REFERENCE_LANGUAGE}: esperado ${JSON.stringify(reference)}, encontrado ${JSON.stringify(other)}`
        })
    }
}

function validateLanguageParity(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []
    const reference = snapshot.languages[REFERENCE_LANGUAGE]

    for (const lang of OTHER_LANGUAGES) {
        const other = snapshot.languages[lang]

        if (reference.profile !== undefined && other.profile !== undefined) {
            compare(
                reference.profile,
                other.profile,
                { classPath: "", shownPath: `content/${lang}/profile.json#` },
                TRANSLATABLE_PATHS.profile,
                issues
            )
        }
        if (reference.timeline !== undefined && other.timeline !== undefined) {
            compare(
                reference.timeline,
                other.timeline,
                { classPath: "items", shownPath: `content/${lang}/timeline.json#items` },
                TRANSLATABLE_PATHS.timeline,
                issues
            )
        }
        if (reference.projects !== undefined && other.projects !== undefined) {
            compare(
                reference.projects,
                other.projects,
                { classPath: "items", shownPath: `content/${lang}/projects.json#items` },
                TRANSLATABLE_PATHS.projects,
                issues
            )
        }
    }

    return issues
}

export default validateLanguageParity
