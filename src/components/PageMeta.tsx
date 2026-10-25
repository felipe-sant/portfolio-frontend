import { useTranslation } from "react-i18next"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import buildAbsoluteUrl from "@/utils/buildAbsoluteUrl"
import getSiteUrl from "@/utils/getSiteUrl"
import publicUrl from "@/utils/publicUrl"

interface PageMetaProps {
    title: string
    description: string
    path: string
    params?: Record<string, string>
    type?: string
    image?: string
}

const DEFAULT_IMAGE = "images/og-site.png"
const IMAGE_WIDTH = "1200"
const IMAGE_HEIGHT = "630"

const OG_LOCALES: Record<SupportedLanguage, string> = {
    "pt-BR": "pt_BR",
    en: "en_US",
    es: "es_ES"
}

function PageMeta({
    title,
    description,
    path,
    params,
    type = "website",
    image = DEFAULT_IMAGE
}: PageMetaProps) {
    const { t, i18n } = useTranslation("common")
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    const canonical = buildAbsoluteUrl(path, language, params)
    const imageUrl = `${getSiteUrl()}${publicUrl(image)}`
    const otherLanguages = SUPPORTED_LANGUAGES.filter((item) => item !== language)

    return (
        <>
            <link rel="canonical" href={canonical} />
            {SUPPORTED_LANGUAGES.map((item) => (
                <link
                    key={item}
                    rel="alternate"
                    hrefLang={item}
                    href={buildAbsoluteUrl(path, item, params)}
                />
            ))}
            <link
                rel="alternate"
                hrefLang="x-default"
                href={buildAbsoluteUrl(path, FALLBACK_LANGUAGE, params)}
            />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:type" content={type} />
            <meta property="og:url" content={canonical} />
            <meta property="og:image" content={imageUrl} />
            <meta property="og:image:width" content={IMAGE_WIDTH} />
            <meta property="og:image:height" content={IMAGE_HEIGHT} />
            <meta property="og:image:alt" content={t("meta.imageAlt")} />
            <meta property="og:locale" content={OG_LOCALES[language]} />
            {otherLanguages.map((item) => (
                <meta key={item} property="og:locale:alternate" content={OG_LOCALES[item]} />
            ))}
            <meta name="twitter:card" content={"summary_large_image"} />
        </>
    )
}

export default PageMeta
