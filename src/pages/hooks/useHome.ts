import { useTranslation } from "react-i18next"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import profileApi from "@/store/api/profile.api"
import projectsApi from "@/store/api/projects.api"
import timelineApi from "@/store/api/timeline.api"
import buildFeaturedProjectsParams from "@/utils/buildFeaturedProjectsParams"
import buildHomeJsonLd from "@/utils/buildHomeJsonLd"
import flattenStack from "@/utils/flattenStack"
import pickCurrentStatus from "@/utils/pickCurrentStatus"

function useHome() {
    const { t, i18n } = useTranslation(["home", "common"])
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
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

    return {
        t,
        language,
        jsonLd,
        profile: {
            isLoading: profileQuery.isLoading,
            isError: profileQuery.isError && !profileQuery.isFetching,
            refetch: profileQuery.refetch,
            availability: profile?.availability,
            intro: profile?.homeIntro,
            stack: flattenStack(profile?.stack ?? [])
        },
        status: {
            isLoading: timelineQuery.isLoading,
            isError: timelineQuery.isError && !timelineQuery.isFetching,
            refetch: timelineQuery.refetch,
            working: status.working,
            studying: status.studying
        },
        featured: {
            isLoading: featuredQuery.isLoading,
            isError: featuredQuery.isError && !featuredQuery.isFetching,
            refetch: featuredQuery.refetch,
            projects: featuredQuery.data?.items ?? []
        }
    }
}

export default useHome
