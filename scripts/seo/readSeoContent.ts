import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import readResumeMarkdown from "@scripts/cv/readResumeMarkdown"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type ListResponse from "@/types/api/ListResponse.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type Profile from "@/types/profile/Profile.types"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"
import type SeoCommonLabels from "@/types/seo/SeoCommonLabels.types"
import type SeoContent from "@/types/seo/SeoContent.types"
import type SeoLanguageContent from "@/types/seo/SeoLanguageContent.types"
import type SeoProject from "@/types/seo/SeoProject.types"
import type SeoProjectDocument from "@/types/seo/SeoProjectDocument.types"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

const DEFAULT_LOCALES_DIRECTORY = join("src", "locales")

function readText(file: string): string {
    if (!existsSync(file)) {
        throw new Error(`Arquivo ausente: ${file}`)
    }

    return readFileSync(file, "utf-8")
}

function readJson<T>(file: string): T {
    const text = readText(file)

    try {
        return JSON.parse(text)
    } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)

        throw new Error(`JSON inválido em ${file}: ${reason}`, { cause: error })
    }
}

function readDocument(
    contentDirectory: string,
    language: SupportedLanguage,
    projectId: string,
    document: ProjectDocument
): SeoProjectDocument {
    const folder = document.translated ? language : "shared"
    const file = join(contentDirectory, folder, "projects", projectId, "docs", document.name)

    if (!existsSync(file)) {
        throw new Error(`Documento ausente: ${file}`)
    }

    return { ...document, text: readFileSync(file, "utf-8") }
}

function readProjects(contentDirectory: string, language: SupportedLanguage): SeoProject[] {
    const records = readJson<ListResponse<ProjectRecord>>(
        join(contentDirectory, language, "projects.json")
    ).items

    return records.map((record) => ({
        ...record,
        documents: record.documents.map((document) =>
            readDocument(contentDirectory, language, record.id, document)
        )
    }))
}

type PageNamespace = keyof SeoCommonLabels["pageDescriptions"]

type PageMeta = {
    meta?: { description?: unknown }
}

function readPageDescription(
    localesDirectory: string,
    language: SupportedLanguage,
    page: PageNamespace
): string {
    const file = join(localesDirectory, language, `${page}.json`)
    const description = readJson<PageMeta>(file).meta?.description

    if (typeof description !== "string" || description.trim() === "") {
        throw new Error(`meta.description ausente em ${file}`)
    }

    return description
}

function readLabels(localesDirectory: string, language: SupportedLanguage): SeoCommonLabels {
    const { authorName, navigation, projectStatus, stackCategory } = readJson<
        Omit<SeoCommonLabels, "pageDescriptions">
    >(join(localesDirectory, language, "common.json"))
    const pageDescriptions = {
        home: readPageDescription(localesDirectory, language, "home"),
        projects: readPageDescription(localesDirectory, language, "projects"),
        about: readPageDescription(localesDirectory, language, "about"),
        contact: readPageDescription(localesDirectory, language, "contact")
    }

    return { authorName, navigation, pageDescriptions, projectStatus, stackCategory }
}

function readLanguage(
    publicDirectory: string,
    localesDirectory: string,
    language: SupportedLanguage
): SeoLanguageContent {
    const contentDirectory = join(publicDirectory, "content")

    return {
        labels: readLabels(localesDirectory, language),
        profile: readJson<Profile>(join(contentDirectory, language, "profile.json")),
        projects: readProjects(contentDirectory, language),
        timeline: readJson<ListResponse<TimelineItemRecord>>(
            join(contentDirectory, language, "timeline.json")
        ).items,
        resume: readResumeMarkdown(language, join(publicDirectory, "cv"))
    }
}

function assertResumePdf(publicDirectory: string, language: SupportedLanguage) {
    const file = join(publicDirectory, "cv", `cv-${language}.pdf`)

    if (!existsSync(file)) {
        throw new Error(`PDF do currículo ausente para o idioma ${language}: ${file}`)
    }
}

function readSeoContent(
    publicDirectory: string,
    localesDirectory = DEFAULT_LOCALES_DIRECTORY
): SeoContent {
    SUPPORTED_LANGUAGES.forEach((language) => assertResumePdf(publicDirectory, language))

    return {
        "pt-BR": readLanguage(publicDirectory, localesDirectory, "pt-BR"),
        en: readLanguage(publicDirectory, localesDirectory, "en"),
        es: readLanguage(publicDirectory, localesDirectory, "es")
    }
}

export default readSeoContent
