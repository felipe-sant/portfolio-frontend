import readText from "@/services/content/readText"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type ProjectDocument from "@/types/project/ProjectDocument.types"

function loadProjectDocument(
    lang: SupportedLanguage,
    projectId: string,
    document: ProjectDocument
): Promise<string> {
    const folder = document.translated ? lang : "shared"

    return readText(`content/${folder}/projects/${projectId}/docs/${document.name}`)
}

export default loadProjectDocument
