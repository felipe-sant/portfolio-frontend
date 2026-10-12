import type { FetchBaseQueryError } from "@reduxjs/toolkit/query"
import ContentException from "@/services/content/ContentException"

function toQueryError(error: unknown): FetchBaseQueryError {
    if (error instanceof ContentException) {
        return error.contentError
    }

    const message = error instanceof Error ? error.message : String(error)

    return { status: "FETCH_ERROR", error: message }
}

export default toQueryError
