import type TimelineItem from "@/types/timeline/TimelineItem.types"
import type TrajectoryLines from "@/types/timeline/TrajectoryLines.types"

function keepPresent(parts: (string | undefined)[]): string[] {
    return parts.filter((part): part is string => Boolean(part))
}

function getTrajectoryLines(item: TimelineItem): TrajectoryLines {
    if (item.kind === "education" && item.organization) {
        return {
            highlight: item.organization,
            details: keepPresent([item.title, item.stage, ...item.details])
        }
    }

    if (item.kind === "experience") {
        return {
            highlight: item.title,
            details: keepPresent([item.organization, ...item.details])
        }
    }

    return {
        highlight: item.title,
        details: keepPresent([item.organization, item.stage, ...item.details])
    }
}

export default getTrajectoryLines
