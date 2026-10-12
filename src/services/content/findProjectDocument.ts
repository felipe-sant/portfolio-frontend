import ContentException from "@/services/content/ContentException"
import createContentError from "@/services/content/createContentError"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

function findProjectDocument(record: ProjectRecord, documentId: string): ProjectDocument {
    const document = record.documents.find((candidate) => candidate.id === documentId)

    if (!document) {
        throw new ContentException(
            createContentError(
                404,
                "NOT_FOUND",
                "Não existe documento com esse identificador no projeto."
            )
        )
    }

    return document
}

export default findProjectDocument
