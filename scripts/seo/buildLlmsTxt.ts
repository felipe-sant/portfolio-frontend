import buildPageUrl from "@scripts/seo/buildPageUrl"
import buildSeoUrl from "@scripts/seo/buildSeoUrl"
import getLlmsFullFileName from "@scripts/seo/getLlmsFullFileName"
import LLMS_LABELS from "@scripts/seo/llmsLabels"
import ROUTES from "@/routers/paths"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type SeoContent from "@/types/seo/SeoContent.types"

const REFERENCE_LANGUAGE = "pt-BR"
const PAGES = ["home", "projects", "about", "contact"] as const

function buildLink(title: string, url: string): string {
    return `[${title}](${url})`
}

function buildPageItems(content: SeoContent, origin: string, base: string): string[] {
    const { navigation } = content[REFERENCE_LANGUAGE].labels

    return PAGES.flatMap((page) =>
        SUPPORTED_LANGUAGES.map((language) => {
            const title = `${navigation[page]} (${LLMS_LABELS[language].languageName})`

            return `- ${buildLink(title, buildPageUrl(origin, base, ROUTES[page], language))}`
        })
    )
}

function buildProjectItems(content: SeoContent, origin: string, base: string): string[] {
    return content[REFERENCE_LANGUAGE].projects.map((project) => {
        const url = buildPageUrl(origin, base, ROUTES.project, REFERENCE_LANGUAGE, {
            id: project.id
        })
        const translations = SUPPORTED_LANGUAGES.filter(
            (language) => language !== REFERENCE_LANGUAGE
        ).map((language) =>
            buildLink(
                LLMS_LABELS[language].languageName,
                buildPageUrl(origin, base, ROUTES.project, language, { id: project.id })
            )
        )

        return `- ${buildLink(project.title, url)}: ${project.summary} (${translations.join(", ")})`
    })
}

function buildResumeItems(origin: string, base: string): string[] {
    return SUPPORTED_LANGUAGES.flatMap((language) => {
        const labels = LLMS_LABELS[language]

        return [
            `- ${buildLink(`${labels.resumeMarkdown} (${labels.languageName})`, buildSeoUrl(origin, base, `cv/cv-${language}.md`))}`,
            `- ${buildLink(`${labels.resumePdf} (${labels.languageName})`, buildSeoUrl(origin, base, `cv/cv-${language}.pdf`))}`
        ]
    })
}

function buildFullTextItems(origin: string, base: string): string[] {
    return SUPPORTED_LANGUAGES.map((language) => {
        const title = `${LLMS_LABELS[language].fullTextTitle} (${LLMS_LABELS[language].languageName})`

        return `- ${buildLink(title, buildSeoUrl(origin, base, getLlmsFullFileName(language)))}`
    })
}

function buildSection(heading: string, items: string[]): string {
    return `## ${heading}\n\n${items.join("\n")}`
}

function buildLlmsTxt(content: SeoContent, origin: string, base: string): string {
    const reference = content[REFERENCE_LANGUAGE]
    const labels = LLMS_LABELS[REFERENCE_LANGUAGE]
    const sections = [
        buildSection(labels.pages, buildPageItems(content, origin, base)),
        buildSection(labels.projects, buildProjectItems(content, origin, base)),
        buildSection(labels.resume, buildResumeItems(origin, base)),
        buildSection(labels.fullText, buildFullTextItems(origin, base))
    ]

    return `# ${reference.labels.authorName}\n\n> ${reference.profile.summary}\n\n${sections.join("\n\n")}\n`
}

export default buildLlmsTxt
