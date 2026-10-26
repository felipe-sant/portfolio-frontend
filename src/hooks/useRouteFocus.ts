import { type RefObject, useEffect, useRef } from "react"
import { useLocation } from "react-router-dom"
import stripLanguagePrefix from "@/i18n/stripLanguagePrefix"
import getProjectContext from "@/utils/getProjectContext"

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

        const previous = getProjectContext(previousPath.current)
        const next = getProjectContext(contentPath)
        previousPath.current = contentPath

        if (previous && previous.id === next?.id) {
            return
        }

        const main = mainRef.current

        if (!main) {
            return
        }

        let focused: HTMLElement | null = null
        const baseline = document.activeElement

        function hasFocusUntouched() {
            const active = document.activeElement

            return !active || active === document.body || active === baseline || !active.isConnected
        }

        function focusCurrentHeading() {
            const heading = main?.querySelector<HTMLElement>("h1")
            const lostFocus = focused
                ? !focused.isConnected || document.activeElement === document.body
                : hasFocusUntouched()

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
