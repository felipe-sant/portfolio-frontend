import collectCertificates from "@/services/content/collectCertificates"
import sortTimelineRecords from "@/services/content/sortTimelineRecords"
import TIMELINE_KINDS from "@/enum/timelineKinds.enum"
import toTimelineItem from "@/services/content/toTimelineItem"
import type ProjectRecord from "@/types/project/ProjectRecord.types"
import type Timeline from "@/types/timeline/Timeline.types"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

function buildTimeline(records: TimelineItemRecord[], projects: ProjectRecord[]): Timeline {
    const groups = TIMELINE_KINDS.map((kind) => ({
        kind,
        items: sortTimelineRecords(records.filter((record) => record.kind === kind)).map((record) =>
            toTimelineItem(record, projects)
        )
    }))

    return { groups, certificates: collectCertificates(groups) }
}

export default buildTimeline
