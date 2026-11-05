import { readdirSync, readFileSync } from "node:fs"
import { join, sep } from "node:path"
import { describe, expect, it } from "vitest"

const SOURCE_ROOT = join(process.cwd(), "src")
const OWNER = ["utils", "loadPdfRenderer.ts"].join(sep)
const EXEMPT_TESTS = [
    ["utils", "test", "pdfjsImports.test.ts"].join(sep),
    ["utils", "test", "loadPdfRenderer.test.ts"].join(sep)
]
const PACKAGE = "pdfjs-dist"

function listSources(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name)

        if (entry.isDirectory()) {
            return listSources(path)
        }

        return /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts") ? [path] : []
    })
}

function withoutTypeImports(source: string) {
    return source.replace(/import type[^"']*["'][^"']*["']/g, "")
}

function mentionsPackage(source: string) {
    return withoutTypeImports(source).includes(PACKAGE)
}

function importsStatically(source: string) {
    return new RegExp(`(^|\\n)\\s*import\\s[^;(]*?from\\s*["']${PACKAGE}[^"']*["']`).test(
        withoutTypeImports(source)
    )
}

const sources = listSources(SOURCE_ROOT)
    .map((path) => path.slice(SOURCE_ROOT.length + 1))
    .filter((relative) => !EXEMPT_TESTS.includes(relative))

describe("importação do pdfjs-dist", () => {
    it("só loadPdfRenderer importa o pdfjs-dist", () => {
        const importers = sources.filter((relative) =>
            mentionsPackage(readFileSync(join(SOURCE_ROOT, relative), "utf-8"))
        )

        expect(importers).toEqual([OWNER])
    })

    it("nenhum arquivo importa o pdfjs-dist de forma estática", () => {
        const staticImporters = sources.filter((relative) =>
            importsStatically(readFileSync(join(SOURCE_ROOT, relative), "utf-8"))
        )

        expect(staticImporters).toEqual([])
    })

    it("loadPdfRenderer importa o pdfjs-dist e o worker só por import()", () => {
        const source = readFileSync(join(SOURCE_ROOT, OWNER), "utf-8")

        expect(source).toMatch(/import\(\s*["']pdfjs-dist\/legacy\/build\/pdf\.mjs["']\s*\)/)
        expect(source).toMatch(
            /import\(\s*["']pdfjs-dist\/legacy\/build\/pdf\.worker\.min\.mjs\?url["']\s*\)/
        )
    })
})
