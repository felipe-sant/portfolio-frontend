import { useTranslation } from "react-i18next"
import useLanguage from "@/hooks/useLanguage"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
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
    imageAlt?: string
    imageWidth?: number
    imageHeight?: number
}

const DEFAULT_IMAGE = "images/og-site.png"
const IMAGE_WIDTH = 1200
const IMAGE_HEIGHT = 630

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
    image = DEFAULT_IMAGE,
    imageAlt,
    imageWidth = IMAGE_WIDTH,
    imageHeight = IMAGE_HEIGHT
}: PageMetaProps) {
    const { t } = useTranslation("common")
    const language = useLanguage()
    const canonical = buildAbsoluteUrl(path, language, params)
    const imageUrl = `${getSiteUrl()}${publicUrl(image)}`
    const otherLanguages = SUPPORTED_LANGUAGES.filter((item) => item !== language)
    const resolvedImageAlt = imageAlt ?? t("meta.imageAlt")

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
            <meta property="og:image:width" content={String(imageWidth)} />
            <meta property="og:image:height" content={String(imageHeight)} />
            <meta property="og:image:alt" content={resolvedImageAlt} />
            <meta property="og:locale" content={OG_LOCALES[language]} />
            {otherLanguages.map((item) => (
                <meta key={item} property="og:locale:alternate" content={OG_LOCALES[item]} />
            ))}
            <meta name="twitter:card" content={"summary_large_image"} />
            <meta name="twitter:title" content={title} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={imageUrl} />
            <meta name="twitter:image:alt" content={resolvedImageAlt} />
        </>
    )
}

export default PageMeta
