import type { ReactNode } from "react"
import css from "@/styles/components/chip.module.css"

interface ChipProps {
    children: ReactNode
    onDark?: boolean
}

function Chip({ children, onDark = false }: ChipProps) {
    return <span className={onDark ? `${css.chip} ${css.onDark}` : css.chip}>{children}</span>
}

export default Chip
