import { useCallback, useSyncExternalStore } from "react"

function useMediaQuery(query: string) {
    const subscribe = useCallback(
        (onChange: () => void) => {
            if (typeof window.matchMedia !== "function") {
                return () => undefined
            }

            const mediaQuery = window.matchMedia(query)
            mediaQuery.addEventListener("change", onChange)

            return () => mediaQuery.removeEventListener("change", onChange)
        },
        [query]
    )

    const getSnapshot = useCallback(
        () => typeof window.matchMedia === "function" && window.matchMedia(query).matches,
        [query]
    )

    return useSyncExternalStore(subscribe, getSnapshot, () => false)
}

export default useMediaQuery
