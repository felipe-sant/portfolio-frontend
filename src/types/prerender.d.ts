import type { HydrationState } from "react-router-dom"
import type RootState from "@/types/store/RootState.types"

declare global {
    interface Window {
        prerenderedPath?: string
        preloadedState?: Partial<RootState>
        routerData?: HydrationState
    }
}
