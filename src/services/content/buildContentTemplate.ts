import createBlankProfile from "@/services/content/template/createBlankProfile"
import createBlankProject from "@/services/content/template/createBlankProject"
import createBlankTimelineItem from "@/services/content/template/createBlankTimelineItem"
import type ContentTemplate from "@/types/content/ContentTemplate.types"

function toJson(value: unknown): string {
    return `${JSON.stringify(value, null, 4)}\n`
}

function buildContentTemplate(): ContentTemplate {
    return {
        "profile.json": toJson(createBlankProfile()),
        "timeline.json": toJson({ items: [createBlankTimelineItem()] }),
        "projects.json": toJson({ items: [createBlankProject()] })
    }
}

export default buildContentTemplate
