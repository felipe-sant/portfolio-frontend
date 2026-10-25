import { mkdirSync, readFileSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "@playwright/test"
import readCatLogoPaths from "@scripts/readCatLogoPaths"

const ROOT = process.cwd()
const OUTPUT = join(ROOT, "public", "images", "og-site.png")
const CAT_LOGO = join(ROOT, "src", "components", "CatLogo.tsx")
const FONT = join(ROOT, "public", "fonts", "bricolage-grotesque-latin-opsz-normal.woff2")
const COMMON = join(ROOT, "src", "locales", "pt-BR", "common.json")
const WIDTH = 1200
const HEIGHT = 630
const BODY_COLOR = "#7c7770"
const DETAIL_COLOR = "#202020"
const BACKGROUND_COLOR = "#fbf9f5"
const ACCENT_COLOR = "#ffcc00"

function readAuthorName(): string {
    const common: { authorName: string } = JSON.parse(readFileSync(COMMON, "utf-8"))
    return common.authorName
}

function buildHtml(name: string): string {
    const paths = readCatLogoPaths(CAT_LOGO)
        .map(
            ({ d, role }) =>
                `<path d="${d}" fill="${role === "body" ? BODY_COLOR : DETAIL_COLOR}" />`
        )
        .join("")

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
    background: ${BACKGROUND_COLOR};
    border-top: 16px solid ${ACCENT_COLOR};
    font-family: "Bricolage Grotesque", sans-serif;
    color: ${DETAIL_COLOR};
}
svg { flex-shrink: 0; height: 240px; width: auto; }
h1 { margin: 0; font-size: 88px; font-weight: 700; line-height: 1.05; letter-spacing: -0.02em; }
</style>
</head>
<body>
<svg viewBox="0 0 29 24" fill="none" aria-hidden="true">${paths}</svg>
<h1>${name}</h1>
</body>
</html>`
}

async function generateOgImage(): Promise<void> {
    const browser = await chromium.launch()

    try {
        const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } })
        await page.setContent(buildHtml(readAuthorName()))
        await page.evaluate("document.fonts.ready")
        mkdirSync(join(ROOT, "public", "images"), { recursive: true })
        await page.screenshot({ path: OUTPUT, type: "png" })
    } finally {
        await browser.close()
    }

    console.log(`Gerado: ${OUTPUT}`)
}

await generateOgImage()
