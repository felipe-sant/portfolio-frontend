// @vitest-environment node
import { describe, expect, it } from "vitest"
import buildLlmsTxt from "@scripts/seo/buildLlmsTxt"
import buildSeoUrl from "@scripts/seo/buildSeoUrl"
import getLlmsFullFileName from "@scripts/seo/getLlmsFullFileName"
import readSeoContent from "@scripts/seo/readSeoContent"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import FATEC_SITE_URL from "@scripts/fatecSiteUrl"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"

const content = readSeoContent("public")
const text = buildLlmsTxt(content, FATEC_SITE_URL, FATEC_BASE_PATH)
const lines = text.split("\n")
const SITE = `${FATEC_SITE_URL}${FATEC_BASE_PATH}`

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

describe("buildLlmsTxt", () => {
    it("abre com o nome em # e o resumo do perfil pt-BR em >", () => {
        expect(lines[0]).toBe(`# ${content["pt-BR"].labels.authorName}`)
        expect(lines[2]).toBe(`> ${content["pt-BR"].profile.summary}`)
    })

    it("usa seções ## em português com itens de lista de links", () => {
        const headings = lines.filter((line) => line.startsWith("## "))
        const items = lines.filter((line) => line.startsWith("- "))

        expect(headings).toEqual(["## Páginas", "## Projetos", "## Currículo", "## Texto completo"])
        items.forEach((item) => expect(item).toMatch(/^- \[[^\]]+\]\(https:\/\/[^)]+\)(: .+)?$/))
    })

    it("liga as quatro páginas nos três idiomas, o currículo e os textos completos", () => {
        const urls = listLinkedUrls()

        expectedUrls().forEach((url) => expect(urls).toContain(url))
    })

    it("lista cada projeto uma vez com o resumo pt-BR e os links en e es", () => {
        content["pt-BR"].projects.forEach((project) => {
            const projectLines = lines.filter((line) => line.includes(`/projects/${project.id})`))

            expect(projectLines).toHaveLength(1)
            expect(projectLines[0]).toContain(
                `[${project.title}](${SITE}pt-BR/projects/${project.id})`
            )
            expect(projectLines[0]).toContain(project.summary)
            expect(projectLines[0]).toContain(`${SITE}en/projects/${project.id}`)
            expect(projectLines[0]).toContain(`${SITE}es/projects/${project.id}`)
        })
    })

    it("só aponta para URLs que existem no build", () => {
        const known = new Set(expectedUrls())

        listLinkedUrls().forEach((url) => expect(known.has(url)).toBe(true))
    })

    it("não traz títulos de projeto traduzidos que diferem do pt-BR", () => {
        content["pt-BR"].projects.forEach((project, index) => {
            const translated = [content.en.projects[index].title, content.es.projects[index].title]

            translated
                .filter((title) => title !== project.title && !project.title.includes(title))
                .forEach((title) => expect(text).not.toContain(title))
        })
    })
})
