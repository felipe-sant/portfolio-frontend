import buildPageUrl from "@scripts/seo/buildPageUrl"
import buildSeoUrl from "@scripts/seo/buildSeoUrl"
import LLMS_LABELS from "@scripts/seo/llmsLabels"
import ROUTES from "@/routers/paths"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type LlmsLabels from "@/types/seo/LlmsLabels.types"
import type SeoContent from "@/types/seo/SeoContent.types"
import type SeoLanguageContent from "@/types/seo/SeoLanguageContent.types"
import type SeoProject from "@/types/seo/SeoProject.types"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

function buildList(items: string[]): string {
    return items.map((item) => `- ${item}`).join("\n")
}

function buildBlock(heading: string, lines: string[]): string[] {
    return lines.length === 0 ? [] : [`${heading}\n\n${lines.join("\n")}`]
}

function buildProfile(
    language: SeoLanguageContent,
    labels: LlmsLabels,
    contactUrl: string
): string {
    const { profile } = language
    const location = [profile.location.city, profile.location.region, profile.location.detail]
        .filter((part) => part !== undefined && part !== "")
        .join(", ")
    const facts = [
        `${labels.location}: ${location}`,
        `${labels.availability}: ${profile.availability.label}`,
        `${language.labels.navigation.contact}: ${contactUrl}`,
        ...(profile.contact.responseTime
            ? [`${labels.responseTime}: ${profile.contact.responseTime.label}`]
            : []),
        ...Object.values(profile.links).filter((link) => link !== undefined)
    ]

    return [
        `## ${labels.profile}`,
        buildList(facts),
        `### ${labels.aboutMe}`,
        profile.aboutParagraphs.join("\n\n"),
        `### ${labels.workPrinciples}`,
        buildList(profile.workPrinciples)
    ].join("\n\n")
}

function buildStack(language: SeoLanguageContent, labels: LlmsLabels): string {
    const groups = language.profile.stack.map((group) => {
        const names = group.items.map((item) => item.name).join(", ")

        return `${language.labels.stackCategory[group.category]}: ${names}`
    })

    return `## ${labels.stack}\n\n${buildList(groups)}`
}

function buildPeriod(item: TimelineItemRecord, labels: LlmsLabels): string {
    return `${item.start} - ${item.end ?? labels.present}`
}

function buildTimelineItem(item: TimelineItemRecord, labels: LlmsLabels): string {
    const header = [
        `### ${item.title}${item.organization ? ` · ${item.organization}` : ""}`,
        `${labels.period}: ${buildPeriod(item, labels)}`,
        ...item.details,
        ...(item.stage ? [item.stage] : []),
        item.summary
    ].join("\n\n")
    const lists = [
        ...buildBlock(
            `**${labels.responsibilities}**`,
            item.responsibilities.map((line) => `- ${line}`)
        ),
        ...buildBlock(
            `**${labels.disciplines}**`,
            item.disciplines.map((line) => `- ${line}`)
        ),
        ...buildBlock(`**${labels.technologies}**`, [item.technologies.join(", ")].filter(Boolean)),
        ...buildBlock(
            `**${labels.certificates}**`,
            item.certificates.map(
                (certificate) =>
                    `- ${certificate.name}${certificate.issuer ? ` (${certificate.issuer})` : ""}`
            )
        )
    ]

    return [header, ...lists].join("\n\n")
}

function buildTimeline(language: SeoLanguageContent, labels: LlmsLabels): string {
    const items = language.timeline.map((item) => buildTimelineItem(item, labels))

    return [`## ${labels.trajectory}`, ...items].join("\n\n")
}

function buildResume(
    language: SupportedLanguage,
    content: SeoLanguageContent,
    labels: LlmsLabels,
    origin: string,
    base: string,
    contactUrl: string
): string {
    const links = buildList([
        `${labels.resumeMarkdown}: ${buildSeoUrl(origin, base, `cv/cv-${language}.md`)}`,
        `${labels.resumePdf}: ${buildSeoUrl(origin, base, `cv/cv-${language}.pdf`)}`
    ])

    const { email } = content.profile.contact
    const trimmedResume = content.resume.trimEnd()
    const resume = email === "" ? trimmedResume : trimmedResume.replaceAll(email, contactUrl)

    return [`## ${labels.resume}`, links, resume].join("\n\n")
}

function buildProject(
    project: SeoProject,
    language: SeoLanguageContent,
    labels: LlmsLabels
): string {
    const stack = project.stack.map(
        (group) =>
            `${language.labels.stackCategory[group.category]}: ${group.items.map((item) => item.name).join(", ")}`
    )
    const facts = [
        `${labels.role}: ${project.role}`,
        `${labels.duration}: ${project.duration}`,
        `${labels.team}: ${project.team}`,
        `${labels.status}: ${language.labels.projectStatus[project.status]}`,
        ...stack.map((line) => `${labels.stack} - ${line}`)
    ]
    const links = [
        ...(project.repositoryUrl ? [`${labels.repository}: ${project.repositoryUrl}`] : []),
        ...(project.demoUrl ? [`${labels.demo}: ${project.demoUrl}`] : [])
    ]
    const images = project.images.map(
        (image) => `${image.alt}${image.caption ? ` (${image.caption})` : ""}`
    )
    const documents = project.documents
        .filter((document) => document.format === "markdown")
        .map((document) => `### ${document.name}\n\n${document.text.trimEnd()}\n\n---`)

    return [
        `## ${labels.project}: ${project.title}`,
        project.summary,
        ...buildBlock(
            `**${labels.factSheet}**`,
            facts.map((line) => `- ${line}`)
        ),
        ...buildBlock(
            `**${labels.links}**`,
            links.map((line) => `- ${line}`)
        ),
        ...buildBlock(
            `**${labels.gallery}**`,
            images.map((line) => `- ${line}`)
        ),
        ...(documents.length > 0 ? [`**${labels.documentation}**`, ...documents] : [])
    ].join("\n\n")
}

function buildLlmsFullTxt(
    language: SupportedLanguage,
    content: SeoContent,
    origin: string,
    base: string
): string {
    const languageContent = content[language]
    const labels = LLMS_LABELS[language]
    const contactUrl = buildPageUrl(origin, base, ROUTES.contact, language)
    const sections = [
        `# ${languageContent.labels.authorName}\n\n> ${languageContent.profile.summary}`,
        buildProfile(languageContent, labels, contactUrl),
        buildStack(languageContent, labels),
        buildTimeline(languageContent, labels),
        buildResume(language, languageContent, labels, origin, base, contactUrl),
        ...languageContent.projects.map((project) => buildProject(project, languageContent, labels))
    ]

    return `${sections.join("\n\n")}\n`
}

export default buildLlmsFullTxt
