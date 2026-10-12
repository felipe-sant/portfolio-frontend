import type StackGroup from "@/types/content/StackGroup.types"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import type ProjectImage from "@/types/project/ProjectImage.types"
import type ProjectStatus from "@/types/project/ProjectStatus.types"
import type ProjectSummary from "@/types/project/ProjectSummary.types"
import type RelatedProject from "@/types/project/RelatedProject.types"

type ProjectDetail = ProjectSummary & {
    role: string
    duration: string
    team: string
    status: ProjectStatus
    stack: StackGroup[]
    demoUrl?: string
    repositoryUrl?: string
    images: ProjectImage[]
    documents: ProjectDocument[]
    related: RelatedProject[]
    updatedAt?: string
}

export default ProjectDetail
