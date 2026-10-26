import { useSyncExternalStore } from "react"

function subscribe() {
    return () => undefined
}

function useHasHydrated(): boolean {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    )
}

export default useHasHydrated
