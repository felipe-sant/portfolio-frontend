import type ContentError from "@/types/api/ContentError.types"

class ContentException extends Error {
    readonly contentError: ContentError

    constructor(contentError: ContentError) {
        super(contentError.data.error.message)
        this.name = "ContentException"
        this.contentError = contentError
    }
}

export default ContentException
