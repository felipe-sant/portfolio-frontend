// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"

const ROOT = process.cwd()
const FONTS_DIRECTORY = join(ROOT, "public", "fonts")
const GLOBAL_CSS = readFileSync(join(ROOT, "src", "styles", "global.css"), "utf8")
const INDEX_HTML = readFileSync(join(ROOT, "index.html"), "utf8")

function listCssFiles(directory: string): string[] {
    return readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry)
        if (statSync(path).isDirectory()) return listCssFiles(path)
        return path.endsWith(".css") ? [path] : []
    })
}

function readFontFaceUrls(css: string): string[] {
    const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? []
    return blocks.flatMap((block) => {
        const match = block.match(/url\("(\/fonts\/[^"]+)"\)/)
        return match ? [match[1]] : []
    })
}

function readPreloadedFonts(html: string): string[] {
    const links = html.match(/<link[^>]*rel="preload"[^>]*>/g) ?? []
    return links.flatMap((link) => {
        const match = link.match(/href="(\/fonts\/[^"]+)"/)
        return match ? [match[1]] : []
    })
}

const styleSources = listCssFiles(join(ROOT, "src", "styles")).map((path) =>
    readFileSync(path, "utf8")
)
const declaredWeights = [...GLOBAL_CSS.matchAll(/^\s*(--weight-[a-z]+):/gm)].map(
    (match) => match[1]
)
const usedWeights = new Set(
    styleSources.flatMap((css) => [...css.matchAll(/var\((--weight-[a-z]+)\)/g)].map((m) => m[1]))
)

describe("pesos de fonte", () => {
    const fontFaceUrls = readFontFaceUrls(GLOBAL_CSS)
    const staticFiles = readdirSync(FONTS_DIRECTORY).filter((name) => name.endsWith(".woff2"))

    it.each(staticFiles)("o arquivo %s tem um @font-face", (name) => {
        expect(fontFaceUrls).toContain(`/fonts/${name}`)
    })

    it.each(fontFaceUrls)("o @font-face de %s aponta para um arquivo existente", (url) => {
        expect(existsSync(join(ROOT, "public", url))).toBe(true)
    })

    it("tem no máximo 2 preloads de fonte", () => {
        expect(readPreloadedFonts(INDEX_HTML).length).toBeLessThanOrEqual(2)
    })

    it.each(readPreloadedFonts(INDEX_HTML))("o preload de %s tem @font-face", (url) => {
        expect(fontFaceUrls).toContain(url)
    })

    it.each(declaredWeights)("o token %s é usado em alguma tela", (token) => {
        expect(usedWeights.has(token)).toBe(true)
    })

    it.each([...usedWeights])("o token usado %s está declarado", (token) => {
        expect(declaredWeights).toContain(token)
    })
})
