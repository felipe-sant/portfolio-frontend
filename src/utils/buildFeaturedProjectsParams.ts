import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectListParams from "@/types/project/ProjectListParams.types"

function buildFeaturedProjectsParams(lang: SupportedLanguage): ProjectListParams {
    return { lang, featured: true, sort: "recent", limit: 4 }
}

export default buildFeaturedProjectsParams
