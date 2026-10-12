import readJson from "@/services/content/readJson"
import type ListResponse from "@/types/api/ListResponse.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

async function loadProjectRecords(lang: SupportedLanguage): Promise<ProjectRecord[]> {
    const content = await readJson<ListResponse<ProjectRecord>>(`content/${lang}/projects.json`)

    return content.items
}

export default loadProjectRecords
