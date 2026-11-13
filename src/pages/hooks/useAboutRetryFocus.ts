import { useEffect, useRef, useState } from "react"
import aboutElementIds from "@/utils/aboutElementIds"

type RetrySource = "profile" | "timeline"

type RetryRequest = {
    source: RetrySource
}

type FocusableName = `${RetrySource}Heading` | `${RetrySource}Alert`

type SourceState = {
    isFetching: boolean
    isError: boolean
    refetch: () => Promise<unknown>
}

type SourcesState = Record<RetrySource, SourceState>

function useAboutRetryFocus(sources: SourcesState) {
    const [retryRequest, setRetryRequest] = useState<RetryRequest | null>(null)
    const handledRetry = useRef<RetryRequest | null>(null)
    const { profile, timeline } = sources
    const { isFetching: isProfileFetching, isError: isProfileError } = profile
    const { isFetching: isTimelineFetching, isError: isTimelineError } = timeline

    useEffect(() => {
        if (retryRequest === null || retryRequest === handledRetry.current) {
            return
        }
        const { source } = retryRequest
        const isFetching = source === "profile" ? isProfileFetching : isTimelineFetching
        if (isFetching) {
            return
        }
        const isError = source === "profile" ? isProfileError : isTimelineError
        const target: FocusableName = isError ? `${source}Alert` : `${source}Heading`
        const element = document.getElementById(aboutElementIds[target])
        if (element) {
            element.focus()
            handledRetry.current = retryRequest
        }
    }, [retryRequest, isProfileFetching, isTimelineFetching, isProfileError, isTimelineError])

    async function retry(source: RetrySource) {
        await sources[source].refetch()
        setRetryRequest({ source })
    }

    return {
        retryProfile: () => retry("profile"),
        retryTimeline: () => retry("timeline")
    }
}

export default useAboutRetryFocus
