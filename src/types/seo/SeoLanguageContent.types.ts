import type Profile from "@/types/profile/Profile.types"
import type SeoProject from "@/types/seo/SeoProject.types"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

type SeoLanguageContent = {
    authorName: string
    profile: Profile
    projects: SeoProject[]
    timeline: TimelineItemRecord[]
    resume: string
}

export default SeoLanguageContent
