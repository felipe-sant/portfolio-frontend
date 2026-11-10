import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "@playwright/test"
import profilePhotoTargets from "@scripts/profilePhotoTargets"

const OUTPUT_DIR = join(process.cwd(), "public", "images", "profile")
const QUALITY = 0.85

function readSource(): string {
    const source = process.argv[2]

    if (!source) {
        throw new Error("Informe o caminho do JPEG: npm run profile:photo -- <arquivo.jpg>")
    }

    return source
}

function buildConversionScript(source: string, side: number): string {
    return `(async () => {
        const image = new Image()
        image.src = ${JSON.stringify(source)}
        await image.decode()
        const canvas = document.createElement("canvas")
        canvas.width = ${side}
        canvas.height = ${side}
        const context = canvas.getContext("2d")
        context.imageSmoothingQuality = "high"
        context.drawImage(image, 0, 0, ${side}, ${side})
        return canvas.toDataURL("image/webp", ${QUALITY})
    })()`
}

async function generateProfilePhoto(): Promise<void> {
    const dataUrl = `data:image/jpeg;base64,${readFileSync(readSource()).toString("base64")}`
    const browser = await chromium.launch()

    try {
        const page = await browser.newPage()

        for (const { file, size } of profilePhotoTargets()) {
            const webp: string = await page.evaluate(buildConversionScript(dataUrl, size))

            mkdirSync(OUTPUT_DIR, { recursive: true })
            const target = join(OUTPUT_DIR, file)
            writeFileSync(target, Buffer.from(webp.split(",")[1], "base64"))
            console.log(`Gerado: ${target}`)
        }
    } finally {
        await browser.close()
    }
}

await generateProfilePhoto()
