import ContentException from "@/services/content/ContentException"
import createContentError from "@/services/content/createContentError"
import type ProjectRecord from "@/types/project/ProjectRecord.types"

function findProjectRecord(records: ProjectRecord[], id: string): ProjectRecord {
    const record = records.find((candidate) => candidate.id === id)

    if (!record) {
        throw new ContentException(
            createContentError(404, "NOT_FOUND", "Não existe projeto com esse identificador.")
        )
    }

    return record
}

export default findProjectRecord
