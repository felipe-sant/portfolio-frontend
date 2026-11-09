import { useCallback, useEffect, useRef, useState } from "react"
import type { AnimationEvent } from "react"

const UNMOUNT_FALLBACK_MS = 400
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'

function useDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [isMounted, setIsMounted] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)

    const open = useCallback(() => {
        setIsMounted(true)
        setIsOpen(true)
    }, [])
    const close = useCallback(() => setIsOpen(false), [])
    const toggle = useCallback(() => {
        if (isOpen) {
            setIsOpen(false)
            return
        }

        open()
    }, [isOpen, open])

    const handleAnimationEnd = useCallback(
        (event: AnimationEvent) => {
            if (event.target === event.currentTarget && !isOpen) {
                setIsMounted(false)
            }
        },
        [isOpen]
    )

    useEffect(() => {
        if (isOpen || !isMounted) {
            return
        }

        const timer = setTimeout(() => setIsMounted(false), UNMOUNT_FALLBACK_MS)

        return () => clearTimeout(timer)
    }, [isOpen, isMounted])

    useEffect(() => {
        if (!isOpen) {
            return
        }

        function closeWhenOutside(event: Event) {
            if (event.target instanceof Node && !containerRef.current?.contains(event.target)) {
                setIsOpen(false)
            }
        }

        function closeOnEscape(event: KeyboardEvent) {
            if (event.key !== "Escape") {
                return
            }

            event.stopPropagation()
            setIsOpen(false)
            buttonRef.current?.focus({ preventScroll: true })
        }

        function closeWhenTabLeaves(event: KeyboardEvent) {
            if (event.key !== "Tab" || !containerRef.current) {
                return
            }

            const focusable = Array.from(
                containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
            )
            const edge = event.shiftKey ? focusable[0] : focusable[focusable.length - 1]

            if (event.target === edge) {
                setIsOpen(false)
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            closeOnEscape(event)
            closeWhenTabLeaves(event)
        }

        const container = containerRef.current
        container?.addEventListener("keydown", handleKeyDown)
        document.addEventListener("pointerdown", closeWhenOutside)
        document.addEventListener("focusin", closeWhenOutside)

        return () => {
            container?.removeEventListener("keydown", handleKeyDown)
            document.removeEventListener("pointerdown", closeWhenOutside)
            document.removeEventListener("focusin", closeWhenOutside)
        }
    }, [isOpen])

    const panelProps = {
        "data-state": isOpen ? "open" : "closed",
        inert: !isOpen,
        onAnimationEnd: handleAnimationEnd
    }

    return { isOpen, isMounted, close, toggle, containerRef, buttonRef, panelProps }
}

export default useDropdown
