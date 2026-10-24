import { useCallback, useEffect, useRef, useState } from "react"

type CopyStatus = "idle" | "copied" | "failed"

const RESET_DELAY_MS = 2200

function useCopyToClipboard() {
    const [status, setStatus] = useState<CopyStatus>("idle")
    const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined)

    const clearTimer = useCallback(() => {
        clearTimeout(timerRef.current)
    }, [])

    const copy = useCallback(
        async (text: string) => {
            let nextStatus: CopyStatus = "copied"

            try {
                await navigator.clipboard.writeText(text)
            } catch {
                nextStatus = "failed"
            }

            clearTimer()
            setStatus(nextStatus)
            timerRef.current = setTimeout(() => setStatus("idle"), RESET_DELAY_MS)
        },
        [clearTimer]
    )

    useEffect(() => clearTimer, [clearTimer])

    return { status, copy }
}

export default useCopyToClipboard
