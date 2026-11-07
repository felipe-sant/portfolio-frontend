// @vitest-environment node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

type FontFace = { family: string; minWeight: number; maxWeight: number; url: string }
type WeightUsage = { family: string | undefined; token: string; source: string }

const ROOT = fileURLToPath(new URL("../..", import.meta.url))
const FONTS_DIRECTORY = join(ROOT, "public", "fonts")
const GLOBAL_CSS = readFileSync(join(ROOT, "src", "styles", "global.css"), "utf8")
const INDEX_HTML = readFileSync(join(ROOT, "index.html"), "utf8")

const FAMILY_BY_TOKEN: Record<string, string> = {
    "--font-heading": "Bricolage Grotesque",
    "--font-body": "IBM Plex Sans",
    "--font-mono": "IBM Plex Mono"
}
const INHERITED_FAMILIES = ["IBM Plex Sans", "Bricolage Grotesque"]

function listCssFiles(directory: string): string[] {
    return readdirSync(directory).flatMap((entry) => {
        const path = join(directory, entry)
        if (statSync(path).isDirectory()) return listCssFiles(path)
        return path.endsWith(".css") ? [path] : []
    })
}

function readFontFaces(css: string): FontFace[] {
    const blocks = css.match(/@font-face\s*\{[^}]*\}/g) ?? []
    return blocks.flatMap((block) => {
        const family = block.match(/font-family:\s*"([^"]+)"/)?.[1]
        const weights = block.match(/font-weight:\s*(\d+)(?:\s+(\d+))?/)
        const url = block.match(/url\("(\/fonts\/[^"]+)"\)/)?.[1]
        if (!family || !weights || !url) return []
        const minWeight = Number(weights[1])
        const maxWeight = Number(weights[2] ?? weights[1])
        return [{ family, minWeight, maxWeight, url }]
    })
}

function readPreloadedFonts(html: string): string[] {
    const links = html.match(/<link[^>]*rel="preload"[^>]*>/g) ?? []
    return links.flatMap((link) => {
        const match = link.match(/href="(\/fonts\/[^"]+)"/)
        return match ? [match[1]] : []
    })
}

function readWeightUsages(source: string, css: string): WeightUsage[] {
    const rules = css.replace(/@font-face\s*\{[^}]*\}/g, "").match(/[^{}]*\{[^{}]*\}/g) ?? []
    return rules.flatMap((rule) => {
        const token = rule.match(/font-weight:\s*var\((--weight-[a-z]+)\)/)?.[1]
        if (!token) return []
        const familyToken = rule.match(/font-family:\s*var\((--font-[a-z]+)\)/)?.[1]
        const family = familyToken ? FAMILY_BY_TOKEN[familyToken] : undefined
        return [{ family, token, source }]
    })
}

const styleFiles = listCssFiles(join(ROOT, "src", "styles"))
const styleSources = styleFiles.map((path) => readFileSync(path, "utf8"))
const declaredWeights = [...GLOBAL_CSS.matchAll(/^\s*(--weight-[a-z]+):\s*(\d+);/gm)].map(
    (match) => ({ token: match[1], value: Number(match[2]) })
)
const weightValueByToken = new Map(declaredWeights.map((weight) => [weight.token, weight.value]))
const usedWeights = new Set(
    styleSources.flatMap((css) => [...css.matchAll(/var\((--weight-[a-z]+)\)/g)].map((m) => m[1]))
)
const weightUsages = styleFiles.flatMap((path, index) =>
    readWeightUsages(path, styleSources[index])
)
const fontFaces = readFontFaces(GLOBAL_CSS)
const fontFaceUrls = fontFaces.map((fontFace) => fontFace.url)
const staticFiles = readdirSync(FONTS_DIRECTORY).filter((name) => name.endsWith(".woff2"))
const preloadedFonts = readPreloadedFonts(INDEX_HTML)

function hasFace(family: string, weight: number): boolean {
    return fontFaces.some(
        (face) => face.family === family && face.minWeight <= weight && weight <= face.maxWeight
    )
}

describe("pesos de fonte", () => {
    it("encontra os tokens, os @font-face, os arquivos e os usos de peso", () => {
        expect(declaredWeights.length).toBeGreaterThan(0)
        expect(usedWeights.size).toBeGreaterThan(0)
        expect(fontFaces.length).toBeGreaterThan(0)
        expect(staticFiles.length).toBeGreaterThan(0)
        expect(weightUsages.length).toBeGreaterThan(0)
        expect(weightUsages.some((usage) => usage.family === "IBM Plex Mono")).toBe(true)
        expect(weightUsages.some((usage) => usage.family === "Bricolage Grotesque")).toBe(true)
    })

    it.each(staticFiles)("o arquivo %s tem um @font-face", (name) => {
        expect(fontFaceUrls).toContain(`/fonts/${name}`)
    })

    it.each(fontFaceUrls)("o @font-face de %s aponta para um arquivo existente", (url) => {
        expect(existsSync(join(ROOT, "public", url))).toBe(true)
    })

    it("tem no máximo 2 preloads de fonte", () => {
        expect(preloadedFonts.length).toBeLessThanOrEqual(2)
    })

    it.each(preloadedFonts)("o preload de %s tem @font-face", (url) => {
        expect(fontFaceUrls).toContain(url)
    })

    it.each(declaredWeights.map((weight) => weight.token))(
        "o token %s é usado em alguma tela",
        (token) => {
            expect(usedWeights.has(token)).toBe(true)
        }
    )

    it.each([...usedWeights])("o token usado %s está declarado", (token) => {
        expect(weightValueByToken.has(token)).toBe(true)
    })

    it("todo peso usado tem @font-face da família que o usa", () => {
        const missing = weightUsages
            .filter((usage) => {
                const value = weightValueByToken.get(usage.token)
                if (value === undefined) return true
                const families = usage.family ? [usage.family] : INHERITED_FAMILIES
                return !families.some((family) => hasFace(family, value))
            })
            .map(
                (usage) =>
                    `${usage.family ?? "herdada"} ${usage.token} em ${usage.source.replace(ROOT, "")}`
            )
        expect([...new Set(missing)]).toEqual([])
    })

    it("nenhuma regra usa font-weight com valor literal", () => {
        const literals = styleFiles.flatMap((path, index) => {
            const rules = styleSources[index].replace(/@font-face\s*\{[^}]*\}/g, "")
            const found = rules.match(/font-weight:(?!\s*var\(--weight-)[^;}]+/g) ?? []
            return found.map((declaration) => `${path.replace(ROOT, "")}: ${declaration.trim()}`)
        })
        expect(literals).toEqual([])
    })

    it("a faixa da Bricolage Grotesque cobre os pesos de --font-heading", () => {
        const headingWeights = weightUsages
            .filter((usage) => usage.family === "Bricolage Grotesque")
            .flatMap((usage) => {
                const value = weightValueByToken.get(usage.token)
                return value === undefined ? [] : [value]
            })
        const face = fontFaces.find((fontFace) => fontFace.family === "Bricolage Grotesque")
        expect(face).toBeDefined()
        expect(Math.min(...headingWeights)).toBeGreaterThanOrEqual(face?.minWeight ?? Infinity)
        expect(Math.max(...headingWeights)).toBeLessThanOrEqual(face?.maxWeight ?? -Infinity)
    })
})
