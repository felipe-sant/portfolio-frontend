import { useTranslation } from "react-i18next"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import type SharePage from "@/types/seo/SharePage.types"
import buildShareImagePath from "@/utils/buildShareImagePath"

type ShareImage = {
    image: string
    imageAlt: string
}

const IMAGE_ALT_KEYS = {
    home: "home:meta.imageAlt",
    projects: "projects:meta.imageAlt",
    about: "about:meta.imageAlt",
    contact: "contact:meta.imageAlt"
} as const satisfies Record<SharePage, string>

function useShareImage(page: SharePage): ShareImage {
    const { t, i18n } = useTranslation(["home", "projects", "about", "contact"])
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    return { image: buildShareImagePath(page, language), imageAlt: t(IMAGE_ALT_KEYS[page]) }
}

export default useShareImage
