import type ResponsiveImage from "@/types/content/ResponsiveImage.types"
import type ProjectCategory from "@/types/project/ProjectCategory.types"
import type ProjectType from "@/types/project/ProjectType.types"

type ProjectSummary = {
    id: string
    title: string
    summary: string
    date: string
    types: ProjectType[]
    category: ProjectCategory
    featured: boolean
    technologies: string[]
    cardTechnologies: string[]
    cover?: ResponsiveImage
}

export default ProjectSummary
