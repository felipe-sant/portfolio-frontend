import type TimelineItem from "@/types/timeline/TimelineItem.types"

type TimelineItemRecord = Omit<TimelineItem, "projects"> & {
    projectIds: string[]
}

export default TimelineItemRecord
