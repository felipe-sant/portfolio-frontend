import { type RefObject, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import stripLanguagePrefix from "@/i18n/stripLanguagePrefix"

function focusHeading(heading: HTMLElement) {
    if (!heading.hasAttribute("tabindex")) {
        heading.setAttribute("tabindex", "-1")
    }

    heading.focus({ preventScroll: true })
}

function useRouteFocus(mainRef: RefObject<HTMLElement | null>) {
    const { pathname } = useLocation()
    const contentPath = stripLanguagePrefix(pathname)
    const previousPath = useRef(contentPath)

    useEffect(() => {
        if (previousPath.current === contentPath) {
            return
        }

        previousPath.current = contentPath

        const main = mainRef.current

        if (!main) {
            return
        }

        let focused: HTMLElement | null = null

        function focusCurrentHeading() {
            const heading = main?.querySelector<HTMLElement>("h1")
            const lostFocus = !focused?.isConnected || document.activeElement === document.body

            if (heading && heading !== focused && lostFocus) {
                focused = heading
                focusHeading(heading)
            }
        }

        focusCurrentHeading()

        const observer = new MutationObserver(focusCurrentHeading)
        observer.observe(main, { childList: true, subtree: true })

        return () => observer.disconnect()
    }, [contentPath, mainRef])
}

export default useRouteFocus
