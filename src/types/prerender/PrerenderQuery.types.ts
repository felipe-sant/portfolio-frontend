import type AppDispatch from "@/types/store/AppDispatch.types"

type PrerenderQueryResult = {
    unsubscribe: () => void
} & PromiseLike<{ isError: boolean; error?: unknown }>

type PrerenderQuery = (dispatch: AppDispatch) => PrerenderQueryResult

export default PrerenderQuery
