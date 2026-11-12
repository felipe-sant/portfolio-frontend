import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import useLanguage from "@/hooks/useLanguage"
import useShareImage from "@/hooks/useShareImage"
import profileApi from "@/store/api/profile.api"
import buildContactJsonLd from "@/utils/buildContactJsonLd"
import contactFormEnabled from "@/utils/contactFormEnabled"

const FOCUS_IDS = {
    heading: "contact-heading",
    alert: "contact-alert"
}

function useContact() {
    const shareImage = useShareImage("contact")
    const { t } = useTranslation(["contact", "common"])
    const language = useLanguage()
    const profileQuery = profileApi.useGetProfileQuery({ lang: language })
    const profile = profileQuery.data
    const isError = profileQuery.isError && !profile
    const jsonLd = buildContactJsonLd(
        language,
        {
            title: t("contact:meta.title"),
            description: t("contact:meta.description"),
            name: t("common:authorName")
        },
        profile
    )

    const [focusRequest, setFocusRequest] = useState<{ id: string } | undefined>(undefined)

    const handledRequestRef = useRef<object | undefined>(undefined)

    useEffect(() => {
        const isAlertMissing = focusRequest?.id === FOCUS_IDS.alert && !isError

        if (!focusRequest || isAlertMissing || handledRequestRef.current === focusRequest) {
            return
        }

        const target = document.getElementById(focusRequest.id)

        if (target) {
            target.focus()
            handledRequestRef.current = focusRequest
        }
    }, [focusRequest, isError])

    async function retry() {
        const result = await profileQuery.refetch()
        setFocusRequest({ id: result.isError ? FOCUS_IDS.alert : FOCUS_IDS.heading })
    }

    return {
        shareImage,
        t,
        jsonLd,
        profile,
        isError,
        isFormEnabled: contactFormEnabled,
        ids: FOCUS_IDS,
        retry
    }
}

export default useContact
