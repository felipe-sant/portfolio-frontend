import buildSeoUrl from "@scripts/seo/buildSeoUrl"
import buildPath from "@/routers/buildPath"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

function buildPageUrl(
    origin: string,
    base: string,
    route: string,
    language: SupportedLanguage,
    params?: Record<string, string>
): string {
    return buildSeoUrl(origin, base, buildPath(route, language, params))
}

export default buildPageUrl
