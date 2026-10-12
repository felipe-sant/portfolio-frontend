import buildCurrentTimeline from "@/services/content/buildCurrentTimeline"
import buildTimeline from "@/services/content/buildTimeline"
import loadProjectRecords from "@/services/content/loadProjectRecords"
import loadTimelineRecords from "@/services/content/loadTimelineRecords"
import toQueryError from "@/services/content/toQueryError"
import validateLang from "@/services/content/validateLang"
import api from "@/store/api"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type CurrentTimeline from "@/types/timeline/CurrentTimeline.types"
import type Timeline from "@/types/timeline/Timeline.types"

type GetTimelineArgs = {
    lang: SupportedLanguage
}

const timelineApi = api.injectEndpoints({
    endpoints: (build) => ({
        getTimeline: build.query<Timeline, GetTimelineArgs>({
            queryFn: async ({ lang }) => {
                try {
                    validateLang(lang)
                    const [records, projects] = await Promise.all([
                        loadTimelineRecords(lang),
                        loadProjectRecords(lang)
                    ])
                    return { data: buildTimeline(records, projects) }
                } catch (error) {
                    return { error: toQueryError(error) }
                }
            }
        }),
        getCurrentTimeline: build.query<CurrentTimeline, GetTimelineArgs>({
            queryFn: async ({ lang }) => {
                try {
                    validateLang(lang)
                    const [records, projects] = await Promise.all([
                        loadTimelineRecords(lang),
                        loadProjectRecords(lang)
                    ])
                    return { data: buildCurrentTimeline(records, projects) }
                } catch (error) {
                    return { error: toQueryError(error) }
                }
            }
        })
    })
})

export default timelineApi
