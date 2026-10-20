import { useEffect } from "react"
import type { RefObject } from "react"

function useFocusOnError(
    ref: RefObject<HTMLElement | null>,
    error: string | undefined,
    enabled: boolean
) {
    useEffect(() => {
        if (enabled && error) {
            ref.current?.focus()
        }
    }, [ref, error, enabled])
}

export default useFocusOnError
