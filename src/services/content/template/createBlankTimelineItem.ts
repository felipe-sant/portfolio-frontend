import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

function createBlankTimelineItem(): TimelineItemRecord {
    return {
        id: "",
        kind: "experience",
        title: "",
        organization: "",
        stage: "",
        details: [""],
        start: "",
        end: "",
        summary: "",
        responsibilities: [""],
        disciplines: [""],
        technologies: [""],
        certificates: [{ id: "", name: "", issuer: "" }],
        projectIds: [""]
    }
}

export default createBlankTimelineItem
