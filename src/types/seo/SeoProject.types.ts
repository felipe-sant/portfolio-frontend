import type ProjectRecord from "@/types/project/ProjectRecord.types"
import type SeoProjectDocument from "@/types/seo/SeoProjectDocument.types"

type SeoProject = Omit<ProjectRecord, "documents"> & {
    documents: SeoProjectDocument[]
}

export default SeoProject
