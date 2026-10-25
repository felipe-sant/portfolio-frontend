import buildPath from "@/routers/buildPath"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import getSiteUrl from "@/utils/getSiteUrl"
import publicUrl from "@/utils/publicUrl"

function buildAbsoluteUrl(
    path: string,
    language: SupportedLanguage,
    params?: Record<string, string>
): string {
    const base = publicUrl("/").replace(/\/+$/, "")

    return `${getSiteUrl()}${base}${buildPath(path, language, params)}`
}

export default buildAbsoluteUrl
