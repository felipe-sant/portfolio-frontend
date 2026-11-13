import type {
    FetchBaseQueryError,
    FetchBaseQueryMeta,
    QueryReturnValue
} from "@reduxjs/toolkit/query"
import toQueryError from "@/services/content/toQueryError"

async function runQueryFn<Result>(
    run: () => Promise<Result>
): Promise<QueryReturnValue<Result, FetchBaseQueryError, FetchBaseQueryMeta | undefined>> {
    try {
        return { data: await run() }
    } catch (error) {
        return { error: toQueryError(error) }
    }
}

export default runQueryFn
