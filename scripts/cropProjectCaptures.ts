import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { chromium } from "@playwright/test"
import decodeWebpDataUrl from "@scripts/decodeWebpDataUrl"
import projectCaptureCrops from "@scripts/projectCaptureCrops"

const OUTPUT_ROOT = join(process.cwd(), "public", "images", "projects")
const QUALITY = 0.85

function readSourceDirectory(): string {
    const directory = process.argv[2]

    if (!directory) {
        throw new Error(
            "Informe a pasta das capturas originais: npm run content:crop-captures -- <pasta>"
        )
    }

    return directory
}

function buildCropScript(
    source: string,
    region: { x: number; y: number; width: number; height: number },
    size: { width: number; height: number }
): string {
    return `(async () => {
        const image = new Image()
        image.src = ${JSON.stringify(source)}
        await image.decode()
        const canvas = document.createElement("canvas")
        canvas.width = ${size.width}
        canvas.height = ${size.height}
        const context = canvas.getContext("2d")
        context.imageSmoothingQuality = "high"
        context.drawImage(image, ${region.x}, ${region.y}, ${region.width}, ${region.height}, 0, 0, ${size.width}, ${size.height})
        return canvas.toDataURL("image/webp", ${QUALITY})
    })()`
}

async function cropProjectCaptures(): Promise<void> {
    const sourceDirectory = readSourceDirectory()
    const browser = await chromium.launch()

    try {
        const page = await browser.newPage()

        for (const { id, region, large, small } of projectCaptureCrops()) {
            const original = readFileSync(join(sourceDirectory, id, "1-large.webp"))
            const source = `data:image/webp;base64,${original.toString("base64")}`
            const targetDirectory = join(OUTPUT_ROOT, id)

            mkdirSync(targetDirectory, { recursive: true })

            for (const [file, size] of [
                ["1-large.webp", large],
                ["1-small.webp", small]
            ] as const) {
                const webp: string = await page.evaluate(buildCropScript(source, region, size))
                const target = join(targetDirectory, file)

                writeFileSync(target, decodeWebpDataUrl(webp))
                console.log(`Gerado: ${target} (${size.width}x${size.height})`)
            }
        }
    } finally {
        await browser.close()
    }
}

await cropProjectCaptures()
