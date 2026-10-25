import type CurrentStatus from "@/types/home/CurrentStatus.types"
import type TimelineItem from "@/types/timeline/TimelineItem.types"

function pickCurrentStatus(items: TimelineItem[]): CurrentStatus {
    return {
        working: items.find((item) => item.kind === "experience"),
        studying: items.find((item) => item.kind === "education" || item.kind === "course")
    }
}

export default pickCurrentStatus
