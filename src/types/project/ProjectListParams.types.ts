import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectCategory from "@/types/project/ProjectCategory.types"
import type ProjectSort from "@/types/project/ProjectSort.types"
import type ProjectType from "@/types/project/ProjectType.types"

type ProjectListParams = {
    lang: SupportedLanguage
    q?: string
    type?: ProjectType
    category?: ProjectCategory
    tech?: string[]
    year?: string[]
    featured?: true
    sort?: ProjectSort
    offset?: number
    limit?: number
}

export default ProjectListParams
