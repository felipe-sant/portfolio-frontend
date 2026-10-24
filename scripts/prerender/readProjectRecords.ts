import { readFile } from "node:fs/promises"
import { join } from "node:path"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ListResponse from "@/types/api/ListResponse.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

async function readProjectRecords(
    lang: SupportedLanguage,
    publicDirectory = "public"
): Promise<ProjectRecord[]> {
    const text = await readFile(join(publicDirectory, "content", lang, "projects.json"), "utf-8")
    const content: ListResponse<ProjectRecord> = JSON.parse(text)

    return content.items
}

export default readProjectRecords
