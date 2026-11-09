import { mkdirSync } from "node:fs"
import { dirname, join } from "node:path"
import { chromium } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import isWithinKilobytes from "@scripts/isWithinKilobytes"
import readmeScreenshotPath from "@scripts/readmeScreenshotPath"

const ROOT = process.cwd()
const HOME_URL = `http://localhost:4173${FATEC_BASE_PATH}pt-BR`
const WIDTH = 1280
const HEIGHT = 800
const MAX_KILOBYTES = 300
const THEMES = ["light", "dark"] as const

async function assertPreviewIsUp(): Promise<void> {
    try {
        await fetch(HOME_URL)
    } catch {
        throw new Error(
            "O preview do Pages não está no ar em http://localhost:4173. Rode npm run build:fatec e npm run preview:fatec antes."
        )
    }
}

async function captureTheme(
    browser: Awaited<ReturnType<typeof chromium.launch>>,
    theme: (typeof THEMES)[number]
): Promise<void> {
    const context = await browser.newContext({
        viewport: { width: WIDTH, height: HEIGHT },
        deviceScaleFactor: 1,
        colorScheme: theme,
        reducedMotion: "reduce"
    })

    try {
        const page = await context.newPage()
        await page.goto(HOME_URL)
        await page.getByRole("heading", { level: 1 }).waitFor()
        await page.waitForFunction(() =>
            Array.from(document.querySelectorAll('[role="status"]')).every(
                (element) => !element.textContent?.trim()
            )
        )
        await page.evaluate("document.fonts.ready")
        const output = join(ROOT, readmeScreenshotPath(theme))
        mkdirSync(dirname(output), { recursive: true })
        const buffer = await page.screenshot({ path: output, type: "png" })

        if (!isWithinKilobytes(buffer.length, MAX_KILOBYTES)) {
            throw new Error(
                `${output} pesa ${buffer.length} bytes, acima de ${MAX_KILOBYTES} KB. Reduza a altura da captura.`
            )
        }

        console.log(`Gerado: ${output}`)
    } finally {
        await context.close()
    }
}

async function generateReadmeScreenshots(): Promise<void> {
    await assertPreviewIsUp()
    const browser = await chromium.launch()

    try {
        for (const theme of THEMES) {
            await captureTheme(browser, theme)
        }
    } finally {
        await browser.close()
    }
}

await generateReadmeScreenshots()
