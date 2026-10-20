import type { ComponentPropsWithRef } from "react"
import Icon from "@/components/Icon"
import css from "@/styles/components/iconButton.module.css"
import type IconName from "@/types/icon/IconName.types"

interface IconButtonProps extends Omit<ComponentPropsWithRef<"button">, "aria-label" | "children"> {
    icon: IconName
    label: string
}

function IconButton({ icon, label, type = "button", className, ...rest }: IconButtonProps) {
    const classes = [css.iconButton, className].filter(Boolean).join(" ")

    return (
        <button {...rest} type={type} className={classes} aria-label={label}>
            <Icon name={icon} size={20} />
        </button>
    )
}

export default IconButton
