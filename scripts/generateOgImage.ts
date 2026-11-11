import { mkdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { chromium, type Page } from "@playwright/test"
import readCatLogoPaths from "@scripts/readCatLogoPaths"
import readColorTokens from "@scripts/readColorTokens"
import SHARE_PAGES from "@/enum/sharePages.enum"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type SharePage from "@/types/seo/SharePage.types"
import buildShareImagePath from "@/utils/buildShareImagePath"

type ShareText = {
    title: string
    subtitle: string
    detail?: string
}

type Locale = {
    common: { authorName: string }
    home: { heading: string; hero: { stack: string } }
    projects: { heading: string }
    about: { hero: { label: string } }
    contact: { heading: string }
}

const ROOT = process.cwd()
const PUBLIC = join(ROOT, "public")
const SITE_IMAGE = join(PUBLIC, "images", "og-site.png")
const CAT_LOGO = join(ROOT, "src", "components", "CatLogo.tsx")
const GLOBAL_CSS = join(ROOT, "src", "styles", "global.css")
const FONT = join(PUBLIC, "fonts", "bricolage-grotesque-latin-opsz-normal.woff2")
const WIDTH = 1200
const HEIGHT = 630
const COLORS = readColorTokens(readFileSync(GLOBAL_CSS, "utf-8"))

function readJson<T>(language: SupportedLanguage, namespace: string): T {
    return JSON.parse(
        readFileSync(join(ROOT, "src", "locales", language, `${namespace}.json`), "utf-8")
    )
}

function readLocale(language: SupportedLanguage): Locale {
    return {
        common: readJson(language, "common"),
        home: readJson(language, "home"),
        projects: readJson(language, "projects"),
        about: readJson(language, "about"),
        contact: readJson(language, "contact")
    }
}

function buildShareText(page: SharePage, locale: Locale): ShareText {
    const name = locale.common.authorName
    const pageTitles: Record<Exclude<SharePage, "home">, string> = {
        projects: locale.projects.heading,
        about: locale.about.hero.label,
        contact: locale.contact.heading
    }

    if (page === "home") {
        return { title: name, subtitle: locale.home.heading, detail: locale.home.hero.stack }
    }
    return { title: pageTitles[page], subtitle: name }
}

function escapeHtml(text: string): string {
    return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
}

function buildCatSvg(): string {
    const paths = readCatLogoPaths(CAT_LOGO)
        .map(
            ({ d, role }) =>
                `<path d="${d}" fill="${role === "body" ? COLORS.body : COLORS.detail}" />`
        )
        .join("")
    return `<svg viewBox="0 0 29 24" fill="none" aria-hidden="true">${paths}</svg>`
}

function buildHtml(content: string): string {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
@font-face {
    font-family: "Bricolage Grotesque";
    font-weight: 400 800;
    src: url("data:font/woff2;base64,${readFileSync(FONT).toString("base64")}") format("woff2");
}
html, body { margin: 0; width: ${WIDTH}px; height: ${HEIGHT}px; }
body {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 72px;
    padding: 0 96px;
    background: ${COLORS.background};
    border-top: 16px solid ${COLORS.accent};
    font-family: "Bricolage Grotesque", sans-serif;
    color: ${COLORS.detail};
}
svg { flex-shrink: 0; height: 240px; width: auto; }
.text { display: flex; flex-direction: column; gap: 20px; }
h1 { margin: 0; font-size: 88px; font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; }
.subtitle { margin: 0; font-size: 44px; font-weight: 600; line-height: 1.15; }
.detail { margin: 0; font-size: 34px; font-weight: 500; line-height: 1.2; color: ${COLORS.body}; }
</style>
</head>
<body>
${buildCatSvg()}
${content}
</body>
</html>`
}

function buildShareContent({ title, subtitle, detail }: ShareText): string {
    const detailLine = detail ? `<p class="detail">${escapeHtml(detail)}</p>` : ""
    return `<div class="text"><h1>${escapeHtml(title)}</h1><p class="subtitle">${escapeHtml(subtitle)}</p>${detailLine}</div>`
}

async function capture(page: Page, html: string, output: string): Promise<void> {
    await page.setContent(html)
    await page.evaluate("document.fonts.ready")
    mkdirSync(dirname(output), { recursive: true })
    await page.screenshot({ path: output, type: "png" })
    console.log(`Gerado: ${output}`)
}

async function generateOgImage(): Promise<void> {
    const browser = await chromium.launch()

    try {
        const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } })
        const authorName = readLocale("pt-BR").common.authorName
        await capture(page, buildHtml(`<h1>${escapeHtml(authorName)}</h1>`), SITE_IMAGE)

        for (const language of SUPPORTED_LANGUAGES) {
            const locale = readLocale(language)
            for (const sharePage of SHARE_PAGES) {
                const output = join(PUBLIC, buildShareImagePath(sharePage, language))
                await capture(
                    page,
                    buildHtml(buildShareContent(buildShareText(sharePage, locale))),
                    output
                )
            }
        }
    } finally {
        await browser.close()
    }
}

await generateOgImage()
