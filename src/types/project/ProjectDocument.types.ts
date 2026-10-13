import type DocumentFormat from "@/types/project/DocumentFormat.types"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

type ProjectDocument = {
    id: string
    name: string
    format: DocumentFormat
    translated: boolean
    contentLanguage?: SupportedLanguage
    updatedAt?: string
}

export default ProjectDocument
