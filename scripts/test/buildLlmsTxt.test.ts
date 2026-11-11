// @vitest-environment node
import { describe, expect, it } from "vitest"
import buildLlmsTxt from "@scripts/seo/buildLlmsTxt"
import buildSeoUrl from "@scripts/seo/buildSeoUrl"
import getLlmsFullFileName from "@scripts/seo/getLlmsFullFileName"
import LLMS_LABELS from "@scripts/seo/llmsLabels"
import readSeoContent from "@scripts/seo/readSeoContent"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import FATEC_SITE_URL from "@scripts/fatecSiteUrl"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const content = readSeoContent("public")
const text = buildLlmsTxt(content, FATEC_SITE_URL, FATEC_BASE_PATH)
const lines = text.split("\n")

function expectedUrls(): string[] {
    const pages = ["", "/projects", "/about", "/contact"]
    const pageUrls = SUPPORTED_LANGUAGES.flatMap((language) =>
        pages.map((page) => buildSeoUrl(FATEC_SITE_URL, FATEC_BASE_PATH, `/${language}${page}`))
    )
    const projectUrls = SUPPORTED_LANGUAGES.flatMap((language) =>
        content["pt-BR"].projects.map((project) =>
            buildSeoUrl(FATEC_SITE_URL, FATEC_BASE_PATH, `/${language}/projects/${project.id}`)
        )
    )
    const resumeUrls = SUPPORTED_LANGUAGES.flatMap((language) =>
        ["md", "pdf"].map((format) =>
            buildSeoUrl(FATEC_SITE_URL, FATEC_BASE_PATH, `cv/cv-${language}.${format}`)
        )
    )
    const fullUrls = SUPPORTED_LANGUAGES.map((language) =>
        buildSeoUrl(FATEC_SITE_URL, FATEC_BASE_PATH, getLlmsFullFileName(language))
    )

    return [...pageUrls, ...projectUrls, ...resumeUrls, ...fullUrls]
}

function listLinkedUrls(): string[] {
    return Array.from(text.matchAll(/\]\(([^)]+)\)/g), ([, url]) => url)
}

const PAGES = ["home", "projects", "about", "contact"] as const
const SECTIONS = ["pages", "projects", "resume", "fullText"] as const

function headingOf(language: SupportedLanguage, section: (typeof SECTIONS)[number]): string {
    return `## ${LLMS_LABELS[language][section]} (${LLMS_LABELS[language].languageName})`
}

function sectionItems(language: SupportedLanguage, section: (typeof SECTIONS)[number]): string[] {
    const start = lines.indexOf(headingOf(language, section))
    const next = lines.findIndex((line, index) => index > start && line.startsWith("## "))

    expect(start).toBeGreaterThan(-1)

    return lines.slice(start + 1, next === -1 ? undefined : next).filter((line) => line !== "")
}

function fileUrl(path: string): string {
    return buildSeoUrl(FATEC_SITE_URL, FATEC_BASE_PATH, path)
}

function pageUrl(language: SupportedLanguage, path: string): string {
    return buildSeoUrl(FATEC_SITE_URL, FATEC_BASE_PATH, `/${language}${path}`)
}

describe("buildLlmsTxt", () => {
    it("abre com o nome em # e o resumo do perfil pt-BR em >, com um único # e um único >", () => {
        expect(lines[0]).toBe(`# ${content["pt-BR"].labels.authorName}`)
        expect(lines[1]).toBe("")
        expect(lines[2]).toBe(`> ${content["pt-BR"].profile.summary}`)
        expect(lines.filter((line) => line.startsWith("# "))).toHaveLength(1)
        expect(lines.filter((line) => line.startsWith(">"))).toHaveLength(1)
    })

    it("traz os resumos en e es em parágrafos, nessa ordem, antes do primeiro ##", () => {
        const firstHeading = lines.findIndex((line) => line.startsWith("## "))
        const intro = lines.slice(3, firstHeading).filter((line) => line !== "")

        expect(intro).toEqual([
            `${LLMS_LABELS.en.languageName}: ${content.en.profile.summary}`,
            `${LLMS_LABELS.es.languageName}: ${content.es.profile.summary}`
        ])
    })

    it("tem as 12 seções ## por idioma, na ordem dos idiomas e sem repetição", () => {
        const headings = lines.filter((line) => line.startsWith("## "))
        const expected = SUPPORTED_LANGUAGES.flatMap((language) =>
            SECTIONS.map((section) => headingOf(language, section))
        )

        expect(headings).toEqual(expected)
        expect(new Set(headings).size).toBe(12)
    })

    it("usa itens de lista de links", () => {
        lines
            .filter((line) => line.startsWith("- "))
            .forEach((item) => expect(item).toMatch(/^- \[[^\]]+\]\(https:\/\/[^)]+\)(: .+)?$/))
    })

    it.each(SUPPORTED_LANGUAGES)(
        "lista as quatro páginas em %s com o nome e a descrição do idioma",
        (language) => {
            const { navigation, pageDescriptions } = content[language].labels
            const routes = { home: "", projects: "/projects", about: "/about", contact: "/contact" }

            expect(sectionItems(language, "pages")).toEqual(
                PAGES.map(
                    (page) =>
                        `- [${navigation[page]}](${pageUrl(language, routes[page])}): ${pageDescriptions[page]}`
                )
            )
        }
    )

    it.each(SUPPORTED_LANGUAGES)(
        "lista cada projeto em %s com o título, o resumo e a URL do idioma",
        (language) => {
            expect(sectionItems(language, "projects")).toEqual(
                content[language].projects.map(
                    (project) =>
                        `- [${project.title}](${pageUrl(language, `/projects/${project.id}`)}): ${project.summary}`
                )
            )
        }
    )

    it.each(SUPPORTED_LANGUAGES)(
        "liga só o currículo e o texto completo de %s nas seções do idioma",
        (language) => {
            const labels = LLMS_LABELS[language]

            expect(sectionItems(language, "resume")).toEqual([
                `- [${labels.resumeMarkdown}](${fileUrl(`cv/cv-${language}.md`)})`,
                `- [${labels.resumePdf}](${fileUrl(`cv/cv-${language}.pdf`)})`
            ])
            expect(sectionItems(language, "fullText")).toEqual([
                `- [${labels.fullTextTitle}](${fileUrl(getLlmsFullFileName(language))})`
            ])
        }
    )

    it("liga cada URL esperada exatamente uma vez", () => {
        expect(listLinkedUrls().toSorted()).toEqual(expectedUrls().toSorted())
    })

    it("só aponta para URLs que existem no build", () => {
        const known = new Set(expectedUrls())

        listLinkedUrls().forEach((url) => expect(known.has(url)).toBe(true))
    })

    it("não traz o e-mail de nenhum idioma", () => {
        SUPPORTED_LANGUAGES.forEach((language) =>
            expect(text).not.toContain(content[language].profile.contact.email)
        )
    })
})
