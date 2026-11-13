import { array, object } from "zod/mini"
import type ListResponse from "@/types/api/ListResponse.types"
import type { ZodMiniType } from "zod/mini"

function listResponse<T>(item: ZodMiniType<T>): ZodMiniType<ListResponse<T>> {
    return object({ items: array(item) })
}

export default listResponse
