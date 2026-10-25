import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const OG_IMAGE = join(process.cwd(), "public", "images", "og-site.png")
const PNG_SIGNATURE = "89504e470d0a1a0a"

describe("og-site.png", () => {
    it("é um PNG de 1200 por 630", () => {
        const file = readFileSync(OG_IMAGE)

        expect(file.subarray(0, 8).toString("hex")).toBe(PNG_SIGNATURE)
        expect(file.subarray(12, 16).toString("ascii")).toBe("IHDR")
        expect(file.readUInt32BE(16)).toBe(1200)
        expect(file.readUInt32BE(20)).toBe(630)
    })
})
