import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import SHARE_PAGES from "@/enum/sharePages.enum"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import buildShareImagePath from "@/utils/buildShareImagePath"

const OG_IMAGE = join(process.cwd(), "public", "images", "og-site.png")
const PNG_SIGNATURE = "89504e470d0a1a0a"
const MAX_SHARE_IMAGE_BYTES = 100 * 1024
const SHARE_IMAGES = SHARE_PAGES.flatMap((page) =>
    SUPPORTED_LANGUAGES.map((language) => buildShareImagePath(page, language))
)

describe("og-site.png", () => {
    it("é um PNG de 1200 por 630", () => {
        const file = readFileSync(OG_IMAGE)

        expect(file.subarray(0, 8).toString("hex")).toBe(PNG_SIGNATURE)
        expect(file.subarray(12, 16).toString("ascii")).toBe("IHDR")
        expect(file.readUInt32BE(16)).toBe(1200)
        expect(file.readUInt32BE(20)).toBe(630)
    })
})

describe("imagens de compartilhamento por página", () => {
    it.each(SHARE_IMAGES)("%s é um PNG de 1200 por 630 com até 100 KB", (path) => {
        const file = readFileSync(join(process.cwd(), "public", path))

        expect(file.subarray(0, 8).toString("hex")).toBe(PNG_SIGNATURE)
        expect(file.subarray(12, 16).toString("ascii")).toBe("IHDR")
        expect(file.readUInt32BE(16)).toBe(1200)
        expect(file.readUInt32BE(20)).toBe(630)
        expect(file.length).toBeLessThanOrEqual(MAX_SHARE_IMAGE_BYTES)
    })
})
