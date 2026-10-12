import type Certificate from "@/types/timeline/Certificate.types"
import type TimelineGroup from "@/types/timeline/TimelineGroup.types"

type Timeline = {
    groups: TimelineGroup[]
    certificates: Certificate[]
}

export default Timeline
