import type { AriaRole, ReactNode } from "react"
import css from "@/styles/components/visuallyHidden.module.css"

interface VisuallyHiddenProps {
    children: ReactNode
    as?: "span" | "div"
    role?: AriaRole
}

function VisuallyHidden({ children, as: Tag = "span", role }: VisuallyHiddenProps) {
    return (
        <Tag className={css.visuallyHidden} role={role}>
            {children}
        </Tag>
    )
}

export default VisuallyHidden
