import type { ComponentPropsWithoutRef, MouseEvent } from "react"
import css from "@/styles/components/button.module.css"
import Icon from "@/components/Icon"
import Spinner from "@/components/Spinner"
import type IconName from "@/types/icon/IconName.types"

interface ButtonProps extends ComponentPropsWithoutRef<"button"> {
    variant?: "primary" | "secondary" | "ghost"
    size?: "sm" | "md" | "lg"
    loading?: boolean
    fullWidth?: boolean
    icon?: IconName
    iconPosition?: "start" | "end"
}

function Button({
    variant = "primary",
    size = "md",
    loading = false,
    fullWidth = false,
    icon,
    iconPosition = "start",
    type = "button",
    className,
    onClick,
    children,
    "aria-disabled": ariaDisabled,
    ...rest
}: ButtonProps) {
    const classes = [css.button, css[variant], css[size], fullWidth && css.fullWidth, className]
        .filter(Boolean)
        .join(" ")

    function handleClick(event: MouseEvent<HTMLButtonElement>) {
        if (loading) {
            event.preventDefault()
            return
        }
        onClick?.(event)
    }

    const visual = loading ? <Spinner /> : icon && <Icon name={icon} />
    const showStart = iconPosition === "start" && visual
    const showEnd = iconPosition === "end" && visual

    return (
        <button
            {...rest}
            type={type}
            className={classes}
            aria-busy={loading || undefined}
            aria-disabled={loading || ariaDisabled || undefined}
            onClick={handleClick}
        >
            {showStart}
            {children}
            {showEnd}
        </button>
    )
}

export default Button
