import { type RefObject, useEffect } from "react"

function decodeHash(hash: string) {
    const id = hash.slice(1)

    try {
        return decodeURIComponent(id)
    } catch {
        return id
    }
}

function useScrollToHash(
    containerRef: RefObject<HTMLElement | null>,
    hash: string,
    isEnabled: boolean
) {
    useEffect(() => {
        const container = containerRef.current

        if (!isEnabled || !container || hash.length < 2) {
            return
        }

        const id = decodeHash(hash)

        function scrollToTarget() {
            const target = document.getElementById(id)

            if (!target || !container?.contains(target)) {
                return false
            }

            target.scrollIntoView()

            return true
        }

        if (scrollToTarget()) {
            return
        }

        const observer = new MutationObserver(() => {
            if (scrollToTarget()) {
                observer.disconnect()
            }
        })
        observer.observe(container, { childList: true, subtree: true })

        return () => observer.disconnect()
    }, [containerRef, hash, isEnabled])
}

export default useScrollToHash
