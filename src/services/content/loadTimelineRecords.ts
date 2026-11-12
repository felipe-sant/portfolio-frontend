import readJson from "@/services/content/readJson"
import type ListResponse from "@/types/api/ListResponse.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

async function loadTimelineRecords(lang: SupportedLanguage): Promise<TimelineItemRecord[]> {
    const content = await readJson<ListResponse<TimelineItemRecord>>(
        `content/${lang}/timeline.json`,
        async () => {
            const [{ default: listResponse }, { default: timelineItemRecordSchema }] =
                await Promise.all([
                    import("@/services/content/schemas/listResponse.schema"),
                    import("@/services/content/schemas/timelineItemRecord.schema")
                ])

            return listResponse(timelineItemRecordSchema)
        }
    )

    return content.items
}

export default loadTimelineRecords
