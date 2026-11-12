import readJson from "@/services/content/readJson"
import type ListResponse from "@/types/api/ListResponse.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

async function loadProjectRecords(lang: SupportedLanguage): Promise<ProjectRecord[]> {
    const content = await readJson<ListResponse<ProjectRecord>>(
        `content/${lang}/projects.json`,
        async () => {
            const [{ default: listResponse }, { default: projectRecordSchema }] = await Promise.all(
                [
                    import("@/services/content/schemas/listResponse.schema"),
                    import("@/services/content/schemas/projectRecord.schema")
                ]
            )

            return listResponse(projectRecordSchema)
        }
    )

    return content.items
}

export default loadProjectRecords
