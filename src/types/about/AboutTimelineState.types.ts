import type Certificate from "@/types/timeline/Certificate.types"
import type TimelineGroup from "@/types/timeline/TimelineGroup.types"

type AboutTimelineState = {
    groups: TimelineGroup[]
    certificates: Certificate[]
    isLoading: boolean
    isError: boolean
    retry: () => void
}

export default AboutTimelineState
