import type ApiError from "@/types/api/ApiError.types"
import type ContentError from "@/types/api/ContentError.types"

type ErrorFields = NonNullable<ApiError["error"]["fields"]>

function createContentError(
    status: number,
    code: string,
    message: string,
    fields?: ErrorFields
): ContentError {
    return {
        status,
        data: { error: fields ? { code, message, fields } : { code, message } }
    }
}

export default createContentError
