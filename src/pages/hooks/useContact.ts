import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import profileApi from "@/store/api/profile.api"
import buildContactJsonLd from "@/utils/buildContactJsonLd"
import contactFormEnabled from "@/utils/contactFormEnabled"

const FOCUS_IDS = {
    heading: "contact-heading",
    alert: "contact-alert"
}

function useContact() {
    const { t, i18n } = useTranslation(["contact", "common"])
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    const profileQuery = profileApi.useGetProfileQuery({ lang: language })
    const profile = profileQuery.data
    const jsonLd = buildContactJsonLd(
        language,
        {
            title: t("contact:meta.title"),
            description: t("contact:meta.description"),
            name: t("common:authorName")
        },
        profile
    )

    const focusTimeoutRef = useRef<number | undefined>(undefined)

    useEffect(() => () => window.clearTimeout(focusTimeoutRef.current), [])

    async function retry() {
        const result = await profileQuery.refetch()
        const target = result.isError ? FOCUS_IDS.alert : FOCUS_IDS.heading

        window.clearTimeout(focusTimeoutRef.current)
        focusTimeoutRef.current = window.setTimeout(
            () => document.getElementById(target)?.focus(),
            0
        )
    }

    return {
        t,
        jsonLd,
        profile,
        isError: profileQuery.isError && !profile,
        isFormEnabled: contactFormEnabled,
        ids: FOCUS_IDS,
        retry
    }
}

export default useContact
