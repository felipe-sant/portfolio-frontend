import { useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import { useLocation } from "react-router-dom"
import TIMELINE_KINDS from "@/enum/timelineKinds.enum"
import useLanguage from "@/hooks/useLanguage"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import useResume from "@/hooks/useResume"
import useShareImage from "@/hooks/useShareImage"
import ROUTES from "@/routers/paths"
import profileApi from "@/store/api/profile.api"
import timelineApi from "@/store/api/timeline.api"
import type TimelineItem from "@/types/timeline/TimelineItem.types"
import buildAboutJsonLd from "@/utils/buildAboutJsonLd"
import formatMonthYear from "@/utils/formatMonthYear"
import sortStackGroups from "@/utils/sortStackGroups"

type RetrySource = "profile" | "timeline"

type RetryRequest = {
    source: RetrySource
}

type FocusableName = `${RetrySource}Heading` | `${RetrySource}Alert`

type SelectedItem = {
    item: TimelineItem
    pathname: string
}

const FOCUS_IDS: Record<FocusableName, string> = {
    profileHeading: "about-hero-heading",
    profileAlert: "about-profile-alert",
    timelineHeading: "about-trajectory-heading",
    timelineAlert: "about-timeline-alert"
}

function useAbout() {
    const shareImage = useShareImage("about")
    const { t } = useTranslation(["about", "common"])
    const language = useLanguage()
    const localizedPath = useLocalizedPath()
    const resume = useResume()
    const { pathname } = useLocation()
    const profileQuery = profileApi.useGetProfileQuery({ lang: language })
    const timelineQuery = timelineApi.useGetTimelineQuery({ lang: language })
    const profile = profileQuery.data
    const timeline = timelineQuery.data
    const [selected, setSelected] = useState<SelectedItem | null>(null)
    const triggers = useRef(new Map<string, HTMLButtonElement>())
    const itemToFocus = useRef<string | null>(null)
    const [retryRequest, setRetryRequest] = useState<RetryRequest | null>(null)
    const handledRetry = useRef<RetryRequest | null>(null)

    if (selected && selected.pathname !== pathname) {
        setSelected(null)
    }

    const selectedItem = selected && selected.pathname === pathname ? selected.item : null

    useEffect(() => {
        if (selectedItem === null && itemToFocus.current !== null) {
            triggers.current.get(itemToFocus.current)?.focus()
            itemToFocus.current = null
        }
    }, [selectedItem])

    const isProfileError = profileQuery.isError && !profileQuery.isFetching
    const isTimelineError = timelineQuery.isError && !timelineQuery.isFetching
    const isProfileFetching = profileQuery.isFetching
    const isTimelineFetching = timelineQuery.isFetching

    useEffect(() => {
        if (retryRequest === null || retryRequest === handledRetry.current) {
            return
        }
        const { source } = retryRequest
        const isFetching = source === "profile" ? isProfileFetching : isTimelineFetching
        if (isFetching) {
            return
        }
        const isError = source === "profile" ? isProfileError : isTimelineError
        const target: FocusableName = isError ? `${source}Alert` : `${source}Heading`
        const element = document.getElementById(FOCUS_IDS[target])
        if (element) {
            element.focus()
            handledRetry.current = retryRequest
        }
    }, [retryRequest, isProfileFetching, isTimelineFetching, isProfileError, isTimelineError])

    async function retry(source: RetrySource) {
        await (source === "profile" ? profileQuery : timelineQuery).refetch()
        setRetryRequest({ source })
    }

    function open(item: TimelineItem) {
        itemToFocus.current = item.id
        setSelected({ item, pathname })
    }

    function close() {
        setSelected(null)
    }

    const registerTrigger = useCallback(
        (id: string) => (element: HTMLButtonElement | null) => {
            if (element) {
                triggers.current.set(id, element)
            } else {
                triggers.current.delete(id)
            }
        },
        []
    )

    const stackGroups = sortStackGroups(profile?.stack ?? [])
    const groups = (timeline?.groups ?? []).filter(
        (group) => TIMELINE_KINDS.includes(group.kind) && group.items.length > 0
    )
    const certificates = timeline?.certificates ?? []
    const workPrinciples = profile?.workPrinciples ?? []
    const updatedLabel = profile && formatMonthYear(profile.updatedAt)
    const isProfilePending = profileQuery.isLoading || isProfileError
    const isTimelinePending = timelineQuery.isLoading || isTimelineError
    const showCertificates = isTimelinePending || certificates.length > 0
    const showWorkStyle = isProfilePending || workPrinciples.length > 0

    return {
        shareImage,
        t,
        language,
        jsonLd: buildAboutJsonLd(language, { name: t("common:authorName") }, profile, timeline),
        isLoading: profileQuery.isLoading || timelineQuery.isLoading,
        resume,
        paths: { contact: localizedPath(ROUTES.contact) },
        ids: FOCUS_IDS,
        profile: {
            data: profile,
            isLoading: profileQuery.isLoading,
            isError: isProfileError,
            retry: () => retry("profile")
        },
        timeline: {
            groups,
            certificates,
            isLoading: timelineQuery.isLoading,
            isError: isTimelineError,
            retry: () => retry("timeline")
        },
        stackGroups,
        workPrinciples,
        updatedLabel,
        show: {
            stack: isProfilePending || stackGroups.length > 0,
            trajectory: isTimelinePending || groups.length > 0,
            certificates: showCertificates,
            workStyle: showWorkStyle,
            complements: showCertificates || showWorkStyle
        },
        selectedItem,
        open,
        close,
        registerTrigger
    }
}

export default useAbout
