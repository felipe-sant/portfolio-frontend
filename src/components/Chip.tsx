import type { ReactNode } from "react"
import css from "@/styles/components/chip.module.css"

interface ChipProps {
    children: ReactNode
}

function Chip({ children }: ChipProps) {
    return <span className={css.chip}>{children}</span>
}

export default Chip
