import buildPageUrl from "@scripts/seo/buildPageUrl"
import buildSeoUrl from "@scripts/seo/buildSeoUrl"
import removeRootPageItems from "@scripts/prerender/removeRootPageItems"
import ROUTES from "@/routers/paths"
import buildPath from "@/routers/buildPath"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type RootPageTexts from "@/types/prerender/RootPageTexts.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const OG_IMAGE = "images/og-site.png"

function escapeText(text: string): string {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function escapeAttribute(text: string): string {
    return escapeText(text).replace(/"/g, "&quot;")
}

function buildLocalHref(base: string, language: SupportedLanguage): string {
    return `${base}${buildPath(ROUTES.home, language).replace(/^\//, "")}`
}

function composeRootPage(
    template: string,
    texts: RootPageTexts,
    origin: string,
    base: string
): string {
    const clean = removeRootPageItems(template)

    if (!/<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/.test(clean) || !clean.includes("</head>")) {
        throw new Error("O index.html não tem <noscript> nem </head> para receber a raiz.")
    }

    const canonical = buildPageUrl(origin, base, ROUTES.home, FALLBACK_LANGUAGE)
    const alternates = [...SUPPORTED_LANGUAGES, "x-default"].map((hreflang) => {
        const language = hreflang === "x-default" ? FALLBACK_LANGUAGE : hreflang
        const href = buildPageUrl(origin, base, ROUTES.home, language as SupportedLanguage)

        return `<link rel="alternate" hreflang="${hreflang}" href="${href}">`
    })
    const title = escapeAttribute(texts.title)
    const description = escapeAttribute(texts.description)
    const headItems = [
        `<link rel="canonical" href="${canonical}">`,
        ...alternates,
        `<meta property="og:title" content="${title}">`,
        `<meta property="og:description" content="${description}">`,
        `<meta property="og:type" content="website">`,
        `<meta property="og:url" content="${canonical}">`,
        `<meta property="og:image" content="${buildSeoUrl(origin, base, OG_IMAGE)}">`
    ].join("")
    const links = SUPPORTED_LANGUAGES.map(
        (language) =>
            `<li><a href="${buildLocalHref(base, language)}" hreflang="${language}" lang="${language}">${escapeText(texts.link[language])}</a></li>`
    ).join("")
    const noscript = `<noscript data-root><h1>${escapeText(texts.heading[FALLBACK_LANGUAGE])}</h1><nav aria-label="${escapeAttribute(texts.languageLabel)}"><ul>${links}</ul></nav></noscript>`

    return clean
        .replace(/<html lang="[^"]*"/, () => `<html lang="${FALLBACK_LANGUAGE}"`)
        .replace(/<title>[^<]*<\/title>/, () => `<title>${escapeText(texts.title)}</title>`)
        .replace(
            /<meta\s+name="description"[^>]*>/,
            () => `<meta name="description" content="${description}">`
        )
        .replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript\s*>/, () => noscript)
        .replace("</head>", () => `${headItems}</head>`)
}

export default composeRootPage
