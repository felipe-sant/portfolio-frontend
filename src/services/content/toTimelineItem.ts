import type ProjectRecord from "@/types/project/ProjectRecord.types"
import type TimelineItem from "@/types/timeline/TimelineItem.types"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

function toTimelineItem(record: TimelineItemRecord, projects: ProjectRecord[]): TimelineItem {
    const { projectIds, ...item } = record

    return {
        ...item,
        projects: projectIds.flatMap((id) => {
            const project = projects.find((candidate) => candidate.id === id)
            return project ? [{ id: project.id, title: project.title }] : []
        })
    }
}

export default toTimelineItem
