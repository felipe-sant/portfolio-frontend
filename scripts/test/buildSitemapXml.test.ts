// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"
import buildSitemapXml from "@scripts/seo/buildSitemapXml"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import FATEC_SITE_URL from "@scripts/fatecSiteUrl"
import ROUTES from "@/routers/paths"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"
import type SitemapEntry from "@/types/seo/SitemapEntry.types"

const ORIGIN = "https://example.com"

function buildEntry(path: string, lastmod?: string): SitemapEntry {
    const suffix = path.replace(/^[^/]+/, "")

    return {
        path,
        alternates: {
            "pt-BR": `pt-BR${suffix}`,
            en: `en${suffix}`,
            es: `es${suffix}`
        },
        lastmod
    }
}

function readLocs(xml: string): string[] {
    return Array.from(xml.matchAll(/<loc>([^<]*)<\/loc>/g), ([, loc]) => loc)
}

describe("buildSitemapXml", () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it("escapa & e < do caminho e mantém o XML bem formado", () => {
        const xml = buildSitemapXml([buildEntry("en/projects/1/docs/A&B<C>.md")], ORIGIN, "/")

        expect(xml).toContain("en/projects/1/docs/A&amp;B&lt;C&gt;.md")
        expect(xml).not.toMatch(/&(?!amp;|lt;|gt;|quot;|apos;)/)
        expect(xml.replace(/<[^<>]*>/g, "")).not.toMatch(/[<>]/)
    })

    it("escapa aspas nos atributos href", () => {
        const xml = buildSitemapXml([buildEntry('en/docs/a"b')], ORIGIN, "/")

        expect(xml).toContain("a&quot;b")
    })

    it("lista quatro xhtml:link por url, com x-default apontando para o en", () => {
        const xml = buildSitemapXml([buildEntry("pt-BR/about")], ORIGIN, "/")
        const links = Array.from(xml.matchAll(/<xhtml:link [^>]*\/>/g), ([link]) => link)

        expect(links).toEqual([
            '<xhtml:link rel="alternate" hreflang="pt-BR" href="https://example.com/pt-BR/about"/>',
            '<xhtml:link rel="alternate" hreflang="en" href="https://example.com/en/about"/>',
            '<xhtml:link rel="alternate" hreflang="es" href="https://example.com/es/about"/>',
            '<xhtml:link rel="alternate" hreflang="x-default" href="https://example.com/en/about"/>'
        ])
    })

    it("cada href listado existe também como loc", () => {
        const entries = ["pt-BR/about", "en/about", "es/about"].map((path) => buildEntry(path))
        const xml = buildSitemapXml(entries, ORIGIN, "/")
        const locs = readLocs(xml)
        const hrefs = Array.from(xml.matchAll(/href="([^"]*)"/g), ([, href]) => href)

        hrefs.forEach((href) => expect(locs).toContain(href))
    })

    it("emite lastmod só quando a entrada tem a data", () => {
        const xml = buildSitemapXml(
            [buildEntry("pt-BR/projects/1", "2025-12-19"), buildEntry("pt-BR/about")],
            ORIGIN,
            "/"
        )

        expect(xml.match(/<lastmod>/g)).toHaveLength(1)
        expect(xml).toContain("<lastmod>2025-12-19</lastmod>")
    })

    it("o loc de /en/projects é a canônica de buildAbsoluteUrl", () => {
        vi.stubEnv("VITE_SITE_URL", ORIGIN)
        vi.stubEnv("BASE_URL", "/")

        const xml = buildSitemapXml([buildEntry("en/projects")], ORIGIN, "/")

        expect(readLocs(xml)).toEqual([buildAbsoluteUrl(ROUTES.projects, "en")])
    })

    it("com a base da Fatec, todo loc leva a origem e o subcaminho", () => {
        const xml = buildSitemapXml(
            [buildEntry("pt-BR"), buildEntry("pt-BR/projects")],
            FATEC_SITE_URL,
            FATEC_BASE_PATH
        )

        readLocs(xml).forEach((loc) =>
            expect(loc.startsWith(`${FATEC_SITE_URL}${FATEC_BASE_PATH}`)).toBe(true)
        )
    })
})
