import type { HydrationState } from "react-router-dom"
import type RootState from "@/types/store/RootState.types"

type PrerenderData = {
    path: string
    state: Partial<RootState>
    routerData: HydrationState
}

export default PrerenderData
