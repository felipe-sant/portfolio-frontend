import { useEffect, useState } from "react"

function useDebounce<T>(value: T, delay: number): T {
    const [debounced, setDebounced] = useState(value)

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(value), delay)

        return () => window.clearTimeout(timer)
    }, [value, delay])

    return debounced
}

export default useDebounce
