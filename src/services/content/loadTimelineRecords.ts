import readJson from "@/services/content/readJson"
import type ListResponse from "@/types/api/ListResponse.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

async function loadTimelineRecords(lang: SupportedLanguage): Promise<TimelineItemRecord[]> {
    const content = await readJson<ListResponse<TimelineItemRecord>>(
        `content/${lang}/timeline.json`
    )

    return content.items
}

export default loadTimelineRecords
