import type Profile from "@/types/profile/Profile.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"
import type TimelineItemRecord from "@/types/timeline/TimelineItemRecord.types"

type LanguageContent = {
    profile?: Profile
    timeline?: TimelineItemRecord[]
    projects?: ProjectRecord[]
}

export default LanguageContent
