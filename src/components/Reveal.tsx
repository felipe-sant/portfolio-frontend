import type { ReactNode } from "react"
import useReveal from "@/hooks/useReveal"

interface RevealProps {
    children: ReactNode
    index?: number
}

function Reveal({ children, index }: RevealProps) {
    const { ref, revealProps } = useReveal<HTMLDivElement>(index)

    return (
        <div ref={ref} {...revealProps} suppressHydrationWarning>
            {children}
        </div>
    )
}

export default Reveal
