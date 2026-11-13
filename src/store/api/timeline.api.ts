import buildCurrentTimeline from "@/services/content/buildCurrentTimeline"
import buildTimeline from "@/services/content/buildTimeline"
import loadProjectRecords from "@/services/content/loadProjectRecords"
import loadTimelineRecords from "@/services/content/loadTimelineRecords"
import validateLang from "@/services/content/validateLang"
import api from "@/store/api"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type CurrentTimeline from "@/types/timeline/CurrentTimeline.types"
import type Timeline from "@/types/timeline/Timeline.types"
import runQueryFn from "@/utils/runQueryFn"

type GetTimelineArgs = {
    lang: SupportedLanguage
}

const timelineApi = api.injectEndpoints({
    endpoints: (build) => ({
        getTimeline: build.query<Timeline, GetTimelineArgs>({
            queryFn: ({ lang }) =>
                runQueryFn(async () => {
                    validateLang(lang)
                    const [records, projects] = await Promise.all([
                        loadTimelineRecords(lang),
                        loadProjectRecords(lang)
                    ])
                    return buildTimeline(records, projects)
                })
        }),
        getCurrentTimeline: build.query<CurrentTimeline, GetTimelineArgs>({
            queryFn: ({ lang }) =>
                runQueryFn(async () => {
                    validateLang(lang)
                    const [records, projects] = await Promise.all([
                        loadTimelineRecords(lang),
                        loadProjectRecords(lang)
                    ])
                    return buildCurrentTimeline(records, projects)
                })
        })
    })
})

export default timelineApi
