import type StackCategory from "@/types/content/StackCategory.types"
import type ProjectStatus from "@/types/project/ProjectStatus.types"

type SeoCommonLabels = {
    authorName: string
    navigation: Record<"home" | "projects" | "about" | "contact", string>
    pageDescriptions: Record<"home" | "projects" | "about" | "contact", string>
    projectStatus: Record<ProjectStatus, string>
    stackCategory: Record<StackCategory, string>
}

export default SeoCommonLabels
