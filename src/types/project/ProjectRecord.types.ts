import type ProjectDetail from "@/types/project/ProjectDetail.types"
import type RelatedProjectRecord from "@/types/project/RelatedProjectRecord.types"

type ProjectRecord = Omit<ProjectDetail, "technologies" | "cover" | "related"> & {
    related: RelatedProjectRecord[]
}

export default ProjectRecord
