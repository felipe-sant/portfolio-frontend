import type ResponsiveImage from "@/types/content/ResponsiveImage.types"

type ProjectImage = ResponsiveImage & {
    alt: string
    caption?: string
}

export default ProjectImage
