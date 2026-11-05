import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { pathToFileURL } from "node:url"
import { chromium } from "@playwright/test"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import buildResumeHtml from "@scripts/cv/buildResumeHtml"
import readResumeMarkdown from "@scripts/cv/readResumeMarkdown"

const FONTS_URL = `${pathToFileURL(join(process.cwd(), "public", "fonts")).href}/`

async function generateResumePdfs(markdownDirectory: string, outputDirectory: string) {
    const documents = SUPPORTED_LANGUAGES.map((language) => ({
        language,
        html: buildResumeHtml(language, readResumeMarkdown(language, markdownDirectory), FONTS_URL)
    }))
    const workDirectory = mkdtempSync(join(tmpdir(), "resume-html-"))
    const browser = await chromium.launch()

    try {
        mkdirSync(outputDirectory, { recursive: true })
        const page = await browser.newPage()

        for (const { language, html } of documents) {
            const source = join(workDirectory, `cv-${language}.html`)
            writeFileSync(source, html)
            await page.goto(pathToFileURL(source).href)
            await page.evaluate("document.fonts.ready")
            await page.pdf({
                path: join(outputDirectory, `cv-${language}.pdf`),
                tagged: true,
                outline: true,
                preferCSSPageSize: true,
                printBackground: true
            })
        }
    } finally {
        await browser.close()
        rmSync(workDirectory, { recursive: true, force: true })
    }
}

export default generateResumePdfs
