import type ApiError from "@/types/api/ApiError.types"

type ContentError = {
    status: number
    data: ApiError
}

export default ContentError
