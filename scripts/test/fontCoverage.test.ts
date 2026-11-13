// @vitest-environment node
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import readWoff2Codepoints from "@scripts/fonts/readWoff2Codepoints"

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const FONTS_DIRECTORY = join(ROOT, "public", "fonts")
const FIRST_LOAD_FONTS = [
    "bricolage-grotesque-latin-opsz-normal",
    "ibm-plex-sans-latin-400-normal",
    "ibm-plex-sans-latin-500-normal",
    "ibm-plex-sans-latin-600-normal",
    "ibm-plex-mono-latin-400-normal",
    "ibm-plex-mono-latin-500-normal"
]
const MAX_FIRST_LOAD_BYTES = 160_000
const CHARACTERS_WITHOUT_GLYPH_IN_ORIGINAL_FONTS = ["→", "↗"]

function listFiles(directory: string, extension: string): string[] {
    return readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry)
        if (statSync(path).isDirectory()) return listFiles(path, extension)
        return path.endsWith(extension) ? [path] : []
    })
}

function readFont(name: string): Buffer {
    return readFileSync(join(FONTS_DIRECTORY, `${name}.woff2`))
}

function readSiteCharacters(): Set<string> {
    const files = [
        ...listFiles(join(ROOT, "src", "locales"), ".json"),
        ...listFiles(join(ROOT, "public", "content"), ".json"),
        ...listFiles(join(ROOT, "public", "cv"), ".md")
    ]
    const characters = new Set<string>()
    for (const file of files) {
        for (const character of readFileSync(file, "utf8")) {
            if (!/\s/.test(character)) characters.add(character)
        }
    }
    return characters
}

describe("readWoff2Codepoints", () => {
    it("lê os caracteres que a fonte cobre", () => {
        const codepoints = readWoff2Codepoints(readFont("ibm-plex-sans-latin-400-normal"))

        expect(codepoints.has("A".codePointAt(0) ?? 0)).toBe(true)
        expect(codepoints.has("ç".codePointAt(0) ?? 0)).toBe(true)
        expect(codepoints.has("あ".codePointAt(0) ?? 0)).toBe(false)
    })
})

describe("fontes da primeira carga", () => {
    it("somam no máximo 160 KB (NF-DE-11)", () => {
        const total = FIRST_LOAD_FONTS.reduce((sum, name) => sum + readFont(name).length, 0)

        expect(total).toBeLessThanOrEqual(MAX_FIRST_LOAD_BYTES)
    })

    it.each(FIRST_LOAD_FONTS)("%s cobre todo caractere dos textos do site", (name) => {
        const codepoints = readWoff2Codepoints(readFont(name))
        const missing = [...readSiteCharacters()].filter(
            (character) =>
                !codepoints.has(character.codePointAt(0) ?? 0) &&
                !CHARACTERS_WITHOUT_GLYPH_IN_ORIGINAL_FONTS.includes(character)
        )

        expect(missing).toEqual([])
    })
})
