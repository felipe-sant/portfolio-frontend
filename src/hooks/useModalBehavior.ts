import { useEffect, useRef } from "react"
import type { RefObject } from "react"

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
const SCROLL_LOCK_ATTRIBUTE = "data-scroll-locked"

type UseModalBehaviorOptions = {
    isOpen: boolean
    onClose: () => void
    boxRef: RefObject<HTMLElement | null>
    titleRef: RefObject<HTMLElement | null>
}

function useModalBehavior({ isOpen, onClose, boxRef, titleRef }: UseModalBehaviorOptions) {
    const onCloseRef = useRef(onClose)

    useEffect(() => {
        onCloseRef.current = onClose
    })

    useEffect(() => {
        if (!isOpen) {
            return
        }

        const origin = document.activeElement
        const appRoot = document.getElementById("root")

        appRoot?.setAttribute("inert", "")
        document.body.setAttribute(SCROLL_LOCK_ATTRIBUTE, "")
        titleRef.current?.focus()

        function trapTab(event: KeyboardEvent) {
            const box = boxRef.current
            const title = titleRef.current

            if (!box) {
                return
            }

            const focusable = Array.from(box.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
            const first = focusable[0]
            const last = focusable[focusable.length - 1]
            const active = document.activeElement
            const isOutside = !(active instanceof Node && box.contains(active))

            if (!first || !last) {
                event.preventDefault()
                title?.focus()
                return
            }

            if (event.shiftKey && (active === first || active === title || isOutside)) {
                event.preventDefault()
                last.focus()
            } else if (!event.shiftKey && (active === last || isOutside)) {
                event.preventDefault()
                first.focus()
            }
        }

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === "Escape") {
                event.stopPropagation()
                onCloseRef.current()
                return
            }

            if (event.key === "Tab") {
                trapTab(event)
            }
        }

        document.addEventListener("keydown", handleKeyDown)

        return () => {
            document.removeEventListener("keydown", handleKeyDown)
            appRoot?.removeAttribute("inert")
            document.body.removeAttribute(SCROLL_LOCK_ATTRIBUTE)

            if (origin instanceof HTMLElement && origin.isConnected) {
                origin.focus()
            }
        }
    }, [isOpen, boxRef, titleRef])
}

export default useModalBehavior
