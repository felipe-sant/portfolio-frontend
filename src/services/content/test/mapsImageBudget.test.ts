// @vitest-environment node
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import readImageSize from "@/services/content/readImageSize"

const MAPS_IMAGES_DIR = join(
    process.cwd(),
    "public",
    "images",
    "projects",
    "01a13188-a1da-7d4b-901c-e7bcc81d497b"
)
const MAX_LARGE_BYTES = 30_000
const MAX_SMALL_BYTES = 15_000

async function readMapsImage(name: string) {
    return new Uint8Array(await readFile(join(MAPS_IMAGES_DIR, name)))
}

describe("peso das capturas do Maps", () => {
    it("mantém o 1-large.webp em 960x540 e até 30 KB", async () => {
        const bytes = await readMapsImage("1-large.webp")

        expect(readImageSize(bytes)).toEqual({ width: 960, height: 540 })
        expect(bytes.length).toBeLessThanOrEqual(MAX_LARGE_BYTES)
    })

    it("mantém o 1-small.webp em 640x360 e sem ficar maior que o atual", async () => {
        const bytes = await readMapsImage("1-small.webp")

        expect(readImageSize(bytes)).toEqual({ width: 640, height: 360 })
        expect(bytes.length).toBeLessThanOrEqual(MAX_SMALL_BYTES)
    })
})
