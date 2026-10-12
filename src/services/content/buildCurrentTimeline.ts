import sortTimelineRecords from "@/services/content/sortTimelineRecords"
import toTimelineItem from "@/services/content/toTimelineItem"
import type ProjectRecord from "@/types/project/ProjectRecord.types"
import type CurrentTimeline from "@/types/timeline/CurrentTimeline.types"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

function buildCurrentTimeline(
    records: TimelineItemRecord[],
    projects: ProjectRecord[]
): CurrentTimeline {
    const ongoing = sortTimelineRecords(records.filter((record) => record.end === undefined))
    const experience = ongoing.find((record) => record.kind === "experience")
    const study = ongoing.find((record) => record.kind !== "experience")
    const current = [experience, study].filter((record) => record !== undefined)

    return { items: current.map((record) => toTimelineItem(record, projects)) }
}

export default buildCurrentTimeline
