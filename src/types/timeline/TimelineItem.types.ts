import type Certificate from "@/types/timeline/Certificate.types"
import type TimelineKind from "@/types/timeline/TimelineKind.types"
import type TimelineProjectRef from "@/types/timeline/TimelineProjectRef.types"

type TimelineItem = {
    id: string
    kind: TimelineKind
    title: string
    organization?: string
    stage?: string
    details: string[]
    start: string
    end?: string
    summary: string
    responsibilities: string[]
    disciplines: string[]
    technologies: string[]
    certificates: Certificate[]
    projects: TimelineProjectRef[]
}

export default TimelineItem
