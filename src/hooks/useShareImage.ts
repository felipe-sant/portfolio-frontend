import { useTranslation } from "react-i18next"
import type SharePage from "@/types/seo/SharePage.types"
import useLanguage from "@/hooks/useLanguage"
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
    const { t } = useTranslation(["home", "projects", "about", "contact"])
    const language = useLanguage()
    return { image: buildShareImagePath(page, language), imageAlt: t(IMAGE_ALT_KEYS[page]) }
}

export default useShareImage
