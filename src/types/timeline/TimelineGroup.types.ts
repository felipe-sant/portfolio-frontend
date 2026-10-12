import type TimelineItem from "@/types/timeline/TimelineItem.types"
import type TimelineKind from "@/types/timeline/TimelineKind.types"

type TimelineGroup = {
    kind: TimelineKind
    items: TimelineItem[]
}

export default TimelineGroup
