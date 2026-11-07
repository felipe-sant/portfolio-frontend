import buildSeoUrl from "@scripts/seo/buildSeoUrl"
import escapeXml from "@scripts/seo/escapeXml"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import type SitemapEntry from "@/types/seo/SitemapEntry.types"

const HEADER = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`

function buildUrl(path: string, origin: string, base: string): string {
    return escapeXml(buildSeoUrl(origin, base, path))
}

function buildAlternate(hreflang: string, path: string, origin: string, base: string): string {
    return `        <xhtml:link rel="alternate" hreflang="${hreflang}" href="${buildUrl(path, origin, base)}"/>`
}

function buildEntryXml(entry: SitemapEntry, origin: string, base: string): string {
    const alternates = [
        ...SUPPORTED_LANGUAGES.map((language) =>
            buildAlternate(language, entry.alternates[language], origin, base)
        ),
        buildAlternate("x-default", entry.alternates[FALLBACK_LANGUAGE], origin, base)
    ]
    const lines = [
        `        <loc>${buildUrl(entry.path, origin, base)}</loc>`,
        ...(entry.lastmod ? [`        <lastmod>${escapeXml(entry.lastmod)}</lastmod>`] : []),
        ...alternates
    ]

    return `    <url>\n${lines.join("\n")}\n    </url>`
}

function buildSitemapXml(entries: SitemapEntry[], origin: string, base: string): string {
    const urls = entries.map((entry) => buildEntryXml(entry, origin, base))

    return `${HEADER}\n${urls.join("\n")}\n</urlset>\n`
}

export default buildSitemapXml
