import { useTranslation } from "react-i18next"
import useLanguage from "@/hooks/useLanguage"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import usePageTransition from "@/hooks/usePageTransition"
import useResume from "@/hooks/useResume"
import useShareImage from "@/hooks/useShareImage"
import ROUTES from "@/routers/paths"
import profileApi from "@/store/api/profile.api"
import projectsApi from "@/store/api/projects.api"
import timelineApi from "@/store/api/timeline.api"
import buildFeaturedProjectsParams from "@/utils/buildFeaturedProjectsParams"
import buildHomeJsonLd from "@/utils/buildHomeJsonLd"
import flattenStack from "@/utils/flattenStack"
import pickCurrentStatus from "@/utils/pickCurrentStatus"

type RetryBlock = "status" | "featured"

type FocusableName = `${RetryBlock}Heading` | `${RetryBlock}Alert`

const FOCUS_IDS: Record<FocusableName, string> = {
    statusHeading: "home-status-heading",
    statusAlert: "home-status-alert",
    featuredHeading: "home-featured-heading",
    featuredAlert: "home-featured-alert"
}

function useHome() {
    const shareImage = useShareImage("home")
    const { t } = useTranslation(["home", "common"])
    const language = useLanguage()
    const localizedPath = useLocalizedPath()
    const viewTransition = usePageTransition()
    const resume = useResume()
    const profileQuery = profileApi.useGetProfileQuery({ lang: language })
    const timelineQuery = timelineApi.useGetCurrentTimelineQuery({ lang: language })
    const featuredQuery = projectsApi.useGetProjectsQuery(buildFeaturedProjectsParams(language))
    const profile = profileQuery.data
    const status = pickCurrentStatus(timelineQuery.data?.items ?? [])
    const jsonLd = buildHomeJsonLd(
        language,
        { name: t("common:authorName"), jobTitle: t("home:heading") },
        profile
    )

    async function retry(block: RetryBlock) {
        const query = block === "status" ? timelineQuery : featuredQuery
        const result = await query.refetch()
        const target: FocusableName = result.isError ? `${block}Alert` : `${block}Heading`

        window.setTimeout(() => document.getElementById(FOCUS_IDS[target])?.focus(), 0)
    }

    const isLoading = profileQuery.isLoading || timelineQuery.isLoading || featuredQuery.isLoading

    return {
        shareImage,
        t,
        language,
        jsonLd,
        isLoading,
        paths: {
            projects: localizedPath(ROUTES.projects),
            about: localizedPath(ROUTES.about)
        },
        viewTransition,
        resume,
        ids: FOCUS_IDS,
        profile: {
            isLoading: profileQuery.isLoading,
            availability: profile?.availability,
            intro: profile?.homeIntro,
            stack: flattenStack(profile?.stack ?? [])
        },
        status: {
            isLoading: timelineQuery.isLoading,
            isError: timelineQuery.isError && !timelineQuery.isFetching,
            retry: () => retry("status"),
            working: status.working,
            studying: status.studying
        },
        featured: {
            isLoading: featuredQuery.isLoading,
            isError: featuredQuery.isError && !featuredQuery.isFetching,
            retry: () => retry("featured"),
            projects: featuredQuery.data?.items ?? []
        }
    }
}

export default useHome
