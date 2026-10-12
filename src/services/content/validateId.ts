import ContentException from "@/services/content/ContentException"
import createContentError from "@/services/content/createContentError"
import isUuidV7 from "@/services/content/isUuidV7"

function validateId(id: unknown): asserts id is string {
    if (!isUuidV7(id)) {
        throw new ContentException(
            createContentError(400, "INVALID_ID", "O identificador deve ser um UUID v7.")
        )
    }
}

export default validateId
