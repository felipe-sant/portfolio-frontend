import { readdirSync, readFileSync } from "node:fs"
import { join, sep } from "node:path"
import { describe, expect, it } from "vitest"

const SOURCE_ROOT = join(process.cwd(), "src")
const OWNER = ["components", "MarkdownDocument.tsx"].join(sep)
const LANGUAGES_OWNER = ["utils", "codeLanguages.ts"].join(sep)
const SELF = ["utils", "test", "markdownImports.test.ts"].join(sep)
const VALIDATION = ["services", "content", "validation"].join(sep) + sep
const PACKAGES = ["react-markdown", "remark-gfm", "rehype-highlight", "rehype-slug", "highlight.js"]

function listSources(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name)

        if (entry.isDirectory()) {
            return listSources(path)
        }

        return /\.(ts|tsx)$/.test(entry.name) && !entry.name.endsWith(".d.ts") ? [path] : []
    })
}

function importsOf(rawSource: string, name: string) {
    const source = rawSource.replace(/import type[^"']*["'][^"']*["']/g, "")
    const escaped = name.replace(/[-/.]/g, "\\$&")

    return new RegExp(`(from|import)\\s*\\(?\\s*["']${escaped}(/[^"']*)?["']`).test(source)
}

describe("importação das bibliotecas de markdown", () => {
    it.each(PACKAGES)("só MarkdownDocument importa %s", (name) => {
        const importers = listSources(SOURCE_ROOT)
            .map((path) => path.slice(SOURCE_ROOT.length + 1))
            .filter((relative) => relative !== SELF && !relative.startsWith(VALIDATION))
            .filter((relative) =>
                importsOf(readFileSync(join(SOURCE_ROOT, relative), "utf-8"), name)
            )

        expect(
            importers.filter((relative) => relative !== OWNER && relative !== LANGUAGES_OWNER)
        ).toEqual([])
    })
})
