import type { ReactNode } from "react"
import css from "@/styles/components/chip.module.css"

interface ChipProps {
    children: ReactNode
    font?: "mono" | "body"
}

function Chip({ children, font = "mono" }: ChipProps) {
    const className = font === "body" ? `${css.chip} ${css.body}` : css.chip

    return <span className={className}>{children}</span>
}

export default Chip
