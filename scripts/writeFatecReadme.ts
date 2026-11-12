import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import isWithinKilobytes from "@scripts/isWithinKilobytes"
import readmeScreenshotPath from "@scripts/readmeScreenshotPath"
import renderFatecReadme from "@scripts/renderFatecReadme"

const TEMPLATE_PATH = "scripts/fatecReadme.template.md"
const THEMES = ["light", "dark"] as const
const MAX_KILOBYTES = 300

type FatecReadmeOrigin = Parameters<typeof renderFatecReadme>[1]

function assertScreenshot(path: string) {
    if (!existsSync(path)) {
        throw new Error(`A captura "${path}" não existe. Gere com npm run readme:images.`)
    }

    if (!isWithinKilobytes(statSync(path).size, MAX_KILOBYTES)) {
        throw new Error(`A captura "${path}" pesa mais de ${MAX_KILOBYTES} KB.`)
    }
}

function writeFatecReadme(
    repositoryDirectory: string,
    origin: FatecReadmeOrigin,
    sourceDirectory: string = process.cwd()
) {
    if (!existsSync(repositoryDirectory)) {
        throw new Error(`O diretório do repositório "${repositoryDirectory}" não existe.`)
    }

    const templatePath = join(sourceDirectory, TEMPLATE_PATH)

    if (!existsSync(templatePath)) {
        throw new Error(`O modelo do README "${templatePath}" não existe.`)
    }

    const screenshots = THEMES.map((theme) => ({
        from: join(sourceDirectory, readmeScreenshotPath(theme)),
        to: join(repositoryDirectory, "docs", "readme", `home-${theme}.png`)
    }))

    for (const screenshot of screenshots) {
        assertScreenshot(screenshot.from)
    }

    const readme = renderFatecReadme(readFileSync(templatePath, "utf-8"), origin)

    mkdirSync(join(repositoryDirectory, "docs", "readme"), { recursive: true })

    for (const screenshot of screenshots) {
        copyFileSync(screenshot.from, screenshot.to)
    }

    writeFileSync(join(repositoryDirectory, "README.md"), readme)
}

export default writeFatecReadme
