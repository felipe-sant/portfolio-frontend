import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import checkObjectKeys from "@/services/content/validation/checkObjectKeys"
import isRecord from "@/services/content/validation/isRecord"
import requireBoolean from "@/services/content/validation/requireBoolean"
import requireList from "@/services/content/validation/requireList"
import validateChangelogVersions from "@/services/content/validation/validateChangelogVersions"
import validateDocumentNames from "@/services/content/validation/validateDocumentNames"
import validateMarkdownDocument from "@/services/content/validation/validateMarkdownDocument"
import validateReadmeSections from "@/services/content/validation/validateReadmeSections"
import type ContentIssue from "@/types/content/ContentIssue.types"
import type ContentSnapshot from "@/types/content/ContentSnapshot.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const README_NAME = "README.md"
const CHANGELOG_NAME = "CHANGELOG.md"
const DOCUMENT_FILE_PATTERN = /^content\/(pt-BR|en|es|shared)\/projects\/[^/]+\/docs\/.+$/

type DocumentFile = { path: string; name: string; format: unknown; translated: boolean }

function documentFilePath(
    lang: SupportedLanguage,
    projectId: string,
    document: DocumentFile
): string {
    return `content/${document.translated ? lang : "shared"}/projects/${projectId}/docs/${document.name}`
}

function decode(bytes: Uint8Array): string | undefined {
    try {
        return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
    } catch {
        return undefined
    }
}

function validateFile(
    file: string,
    document: DocumentFile,
    lang: SupportedLanguage,
    snapshot: ContentSnapshot,
    projectDocuments: Record<string, string[]>,
    issues: ContentIssue[]
): void {
    const bytes = snapshot.files[file]

    if (!bytes) {
        issues.push({ path: document.path, message: `Arquivo do documento inexistente: ${file}` })
        return
    }

    const text = decode(bytes)

    if (text === undefined) {
        issues.push({ path: file, message: "O documento deve estar em UTF-8" })
        return
    }
    if (text.trim() === "") {
        issues.push({ path: file, message: "Documento vazio" })
        return
    }
    if (document.format !== "markdown") {
        return
    }

    issues.push(...validateMarkdownDocument(file, text, projectDocuments))
    if (document.name === README_NAME) {
        issues.push(...validateReadmeSections(file, text, lang))
    }
    if (document.name === CHANGELOG_NAME) {
        issues.push(...validateChangelogVersions(file, text))
    }
}

function validateDocuments(snapshot: ContentSnapshot): ContentIssue[] {
    const issues: ContentIssue[] = []
    const expectedFiles = new Set<string>()

    for (const lang of SUPPORTED_LANGUAGES) {
        const projects = snapshot.languages[lang].projects ?? []
        const projectDocuments: Record<string, string[]> = {}

        for (const project of projects) {
            projectDocuments[project.id] = (
                Array.isArray(project.documents) ? project.documents : []
            ).flatMap((document) =>
                isRecord(document) && typeof document.name === "string" ? [document.name] : []
            )
        }

        projects.forEach((project, index) => {
            const path = `content/${lang}/projects.json#items[${index}].documents`
            const documents = requireList(project.documents, path, issues)
            const known: DocumentFile[] = []

            documents.forEach((document, position) => {
                const documentPath = `${path}[${position}]`
                if (
                    !checkObjectKeys(
                        document,
                        documentPath,
                        ["id", "name", "format", "translated"],
                        ["contentLanguage", "updatedAt"],
                        issues
                    )
                ) {
                    return
                }
                requireBoolean(document, "translated", documentPath, issues)
                if ("contentLanguage" in document) {
                    const isLanguage = SUPPORTED_LANGUAGES.some(
                        (item) => item === document.contentLanguage
                    )
                    if (!isLanguage || document.translated !== false) {
                        issues.push({
                            path: `${documentPath}.contentLanguage`,
                            message:
                                "O contentLanguage só vale em documento neutro e deve ser pt-BR, en ou es"
                        })
                    }
                }
                if (typeof document.name === "string" && typeof document.translated === "boolean") {
                    known.push({
                        path: documentPath,
                        name: document.name,
                        format: document.format,
                        translated: document.translated
                    })
                }
            })

            issues.push(
                ...validateDocumentNames(
                    path,
                    known.map((document) => document.name)
                )
            )

            const readme = known.find((document) => document.name === README_NAME)
            if (!readme) {
                issues.push({ path, message: "O projeto precisa do documento README.md" })
            } else if (readme.format !== "markdown" || !readme.translated) {
                issues.push({
                    path: readme.path,
                    message: "O README.md deve ser markdown e traduzido"
                })
            }

            for (const document of known) {
                const file = documentFilePath(lang, project.id, document)
                expectedFiles.add(file)

                if (document.translated || lang === "pt-BR") {
                    validateFile(file, document, lang, snapshot, projectDocuments, issues)
                }
            }
        })
    }

    for (const file of Object.keys(snapshot.files)) {
        if (DOCUMENT_FILE_PATTERN.test(file) && !expectedFiles.has(file)) {
            issues.push({
                path: file,
                message:
                    "Arquivo de documento sem declaração correspondente: confira translated e a pasta do idioma ou shared"
            })
        }
    }

    return issues
}

export default validateDocuments
