import css from "@/styles/components/spinner.module.css"
import Icon from "@/components/Icon"
import VisuallyHidden from "@/components/VisuallyHidden"
import type IconSize from "@/types/icon/IconSize.types"

interface SpinnerProps {
    size?: IconSize
    label?: string
}

function Spinner({ size = 14, label }: SpinnerProps) {
    const isLabelled = label !== undefined

    return (
        <span
            className={css.spinner}
            role={isLabelled ? "status" : undefined}
            aria-hidden={isLabelled ? undefined : "true"}
        >
            <span className={css.arc} aria-hidden="true">
                <Icon name="spinner" size={size} />
            </span>
            {isLabelled && <VisuallyHidden>{label}</VisuallyHidden>}
        </span>
    )
}

export default Spinner
