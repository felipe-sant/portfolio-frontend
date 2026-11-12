import buildPageUrl from "@scripts/seo/buildPageUrl"
import buildSeoUrl from "@scripts/seo/buildSeoUrl"
import getLlmsFullFileName from "@scripts/seo/getLlmsFullFileName"
import LLMS_LABELS from "@scripts/seo/llmsLabels"
import ROUTES from "@/routers/paths"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type SeoContent from "@/types/seo/SeoContent.types"

const REFERENCE_LANGUAGE = "pt-BR"
const PAGES = ["home", "projects", "about", "contact"] as const

function buildLink(title: string, url: string): string {
    return `[${title}](${url})`
}

function buildPageItems(
    content: SeoContent,
    language: SupportedLanguage,
    origin: string,
    base: string
): string[] {
    const { navigation, pageDescriptions } = content[language].labels

    return PAGES.map((page) => {
        const url = buildPageUrl(origin, base, ROUTES[page], language)

        return `- ${buildLink(navigation[page], url)}: ${pageDescriptions[page]}`
    })
}

function buildProjectItems(
    content: SeoContent,
    language: SupportedLanguage,
    origin: string,
    base: string
): string[] {
    return content[language].projects.map((project) => {
        const url = buildPageUrl(origin, base, ROUTES.project, language, { id: project.id })

        return `- ${buildLink(project.title, url)}: ${project.summary}`
    })
}

function buildResumeItems(language: SupportedLanguage, origin: string, base: string): string[] {
    const labels = LLMS_LABELS[language]

    return [
        `- ${buildLink(labels.resumeMarkdown, buildSeoUrl(origin, base, `cv/cv-${language}.md`))}`,
        `- ${buildLink(labels.resumePdf, buildSeoUrl(origin, base, `cv/cv-${language}.pdf`))}`
    ]
}

function buildFullTextItems(language: SupportedLanguage, origin: string, base: string): string[] {
    const url = buildSeoUrl(origin, base, getLlmsFullFileName(language))

    return [`- ${buildLink(LLMS_LABELS[language].fullTextTitle, url)}`]
}

function buildSection(language: SupportedLanguage, heading: string, items: string[]): string {
    return `## ${heading} (${LLMS_LABELS[language].languageName})\n\n${items.join("\n")}`
}

function buildLanguageSections(
    content: SeoContent,
    language: SupportedLanguage,
    origin: string,
    base: string
): string[] {
    const labels = LLMS_LABELS[language]

    return [
        buildSection(language, labels.pages, buildPageItems(content, language, origin, base)),
        buildSection(language, labels.projects, buildProjectItems(content, language, origin, base)),
        buildSection(language, labels.resume, buildResumeItems(language, origin, base)),
        buildSection(language, labels.fullText, buildFullTextItems(language, origin, base))
    ]
}

function buildTranslatedSummaries(content: SeoContent): string[] {
    return SUPPORTED_LANGUAGES.filter((language) => language !== REFERENCE_LANGUAGE).map(
        (language) => `${LLMS_LABELS[language].languageName}: ${content[language].profile.summary}`
    )
}

function buildLlmsTxt(content: SeoContent, origin: string, base: string): string {
    const reference = content[REFERENCE_LANGUAGE]
    const blocks = [
        `# ${reference.labels.authorName}`,
        `> ${reference.profile.summary}`,
        ...buildTranslatedSummaries(content),
        ...SUPPORTED_LANGUAGES.flatMap((language) =>
            buildLanguageSections(content, language, origin, base)
        )
    ]

    return `${blocks.join("\n\n")}\n`
}

export default buildLlmsTxt
