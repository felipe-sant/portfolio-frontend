import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { describe, expect, it } from "vitest"
import buildResumeHtml from "@scripts/cv/buildResumeHtml"
import readResumeMarkdown from "@scripts/cv/readResumeMarkdown"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"

const FONTS_DIRECTORY = join(process.cwd(), "public", "fonts")
const FONTS_URL = `${pathToFileURL(FONTS_DIRECTORY).href}/`
const CV_DIRECTORY = join(process.cwd(), "public", "cv")

describe("buildResumeHtml", () => {
    it.each(SUPPORTED_LANGUAGES)("declara o lang %s no html", (language) => {
        const html = buildResumeHtml(
            language,
            readResumeMarkdown(language, CV_DIRECTORY),
            FONTS_URL
        )

        expect(html).toContain(`<html lang="${language}">`)
    })

    it.each(SUPPORTED_LANGUAGES)("tem um h1 com o nome em %s", (language) => {
        const html = buildResumeHtml(
            language,
            readResumeMarkdown(language, CV_DIRECTORY),
            FONTS_URL
        )

        expect(html.match(/<h1>/g)).toHaveLength(1)
        expect(html).toContain("<h1>Luiz Felipe dos Santos</h1>")
    })

    it.each(SUPPORTED_LANGUAGES)("preserva títulos e listas do Markdown em %s", (language) => {
        const markdown = readResumeMarkdown(language, CV_DIRECTORY)
        const html = buildResumeHtml(language, markdown, FONTS_URL)
        const headings = markdown.match(/^## .+$/gm) ?? []
        const items = markdown.match(/^- /gm) ?? []

        expect(headings.length).toBeGreaterThan(0)
        expect(html.match(/<h2>/g)).toHaveLength(headings.length)
        expect(html.match(/<li>/g)).toHaveLength(items.length)
    })

    it("preserva os links do Markdown", () => {
        const html = buildResumeHtml(
            "en",
            "# Name\n\n[Site](https://example.com/page)\n",
            FONTS_URL
        )

        expect(html).toContain('<a href="https://example.com/page">Site</a>')
    })

    it("usa só fontes de public/fonts e nenhuma URL de rede", () => {
        const html = buildResumeHtml("pt-BR", "# Name\n", FONTS_URL)
        const urls = [...html.matchAll(/url\("([^"]+)"\)/g)].map((match) => match[1])

        expect(urls.length).toBeGreaterThan(0)
        for (const url of urls) {
            expect(url.startsWith(FONTS_URL)).toBe(true)
            expect(existsSync(join(FONTS_DIRECTORY, url.slice(FONTS_URL.length)))).toBe(true)
        }
        expect(html).not.toMatch(/https?:\/\/fonts|@import/)
        expect(
            readFileSync(join(process.cwd(), "scripts", "cv", "resume.css"), "utf-8")
        ).not.toMatch(/https?:/)
    })
})
