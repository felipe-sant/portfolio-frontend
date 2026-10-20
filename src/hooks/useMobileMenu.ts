import { useCallback, useEffect, useId, useRef, useState } from "react"
import { useLocation } from "react-router-dom"
import stripLanguagePrefix from "@/i18n/stripLanguagePrefix"
import type MobileMenu from "@/types/navigation/MobileMenu.types"

const DESKTOP_QUERY = "(min-width: 640px)"
const FOCUSABLE_SELECTOR = "a[href], button:not([disabled])"

function getFocusable(panel: HTMLElement | null): HTMLElement[] {
    return panel ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : []
}

function useMobileMenu(): MobileMenu {
    const [isOpen, setIsOpen] = useState(false)
    const panelId = useId()
    const buttonRef = useRef<HTMLButtonElement>(null)
    const panelRef = useRef<HTMLDivElement>(null)
    const { pathname } = useLocation()
    const contentPath = stripLanguagePrefix(pathname)

    const close = useCallback(() => setIsOpen(false), [])
    const toggle = useCallback(() => setIsOpen((current) => !current), [])

    const [openedPath, setOpenedPath] = useState(contentPath)

    if (openedPath !== contentPath) {
        setOpenedPath(contentPath)
        setIsOpen(false)
    }

    useEffect(() => {
        if (!isOpen) {
            return
        }

        getFocusable(panelRef.current)[0]?.focus()

        const previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                setIsOpen(false)
                buttonRef.current?.focus()
                return
            }

            if (event.key !== "Tab") {
                return
            }

            const focusable = getFocusable(panelRef.current)
            const last = focusable[focusable.length - 1]
            const active = document.activeElement

            if (!event.shiftKey && active === last) {
                event.preventDefault()
                buttonRef.current?.focus()
            } else if (event.shiftKey && active === buttonRef.current) {
                event.preventDefault()
                last?.focus()
            }
        }

        document.addEventListener("keydown", handleKeyDown)

        const mediaQuery =
            typeof window.matchMedia === "function" ? window.matchMedia(DESKTOP_QUERY) : undefined
        const handleChange = (event: MediaQueryListEvent) => {
            if (event.matches) {
                setIsOpen(false)
            }
        }

        mediaQuery?.addEventListener("change", handleChange)

        return () => {
            document.body.style.overflow = previousOverflow
            document.removeEventListener("keydown", handleKeyDown)
            mediaQuery?.removeEventListener("change", handleChange)
        }
    }, [isOpen])

    return { isOpen, panelId, buttonRef, panelRef, toggle, close }
}

export default useMobileMenu
