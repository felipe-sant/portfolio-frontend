import { useTranslation } from "react-i18next"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import profileApi from "@/store/api/profile.api"
import buildHomeJsonLd from "@/utils/buildHomeJsonLd"

function useHome() {
    const { t, i18n } = useTranslation(["home", "common"])
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    const { data: profile } = profileApi.useGetProfileQuery({ lang: language })
    const jsonLd = buildHomeJsonLd(
        language,
        { name: t("common:authorName"), jobTitle: t("home:heading") },
        profile
    )

    return { t, jsonLd }
}

export default useHome
