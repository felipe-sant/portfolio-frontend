import type { RefObject } from "react"

interface MobileMenu {
    isOpen: boolean
    panelId: string
    buttonRef: RefObject<HTMLButtonElement | null>
    panelRef: RefObject<HTMLDivElement | null>
    toggle: () => void
    close: () => void
}

export default MobileMenu
