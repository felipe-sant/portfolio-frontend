import type { ComponentPropsWithoutRef } from "react"
import { Link } from "react-router-dom"
import usePageTransition from "@/hooks/usePageTransition"
import buttonCss from "@/styles/components/button.module.css"
import css from "@/styles/components/buttonLink.module.css"

interface ButtonLinkProps extends Omit<ComponentPropsWithoutRef<typeof Link>, "viewTransition"> {
    variant?: "primary" | "secondary"
    size?: "sm" | "md" | "lg"
}

function ButtonLink({
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
}: ButtonLinkProps) {
    const viewTransition = usePageTransition()
    const classes = [buttonCss.button, buttonCss[variant], buttonCss[size], css.link, className]
        .filter(Boolean)
        .join(" ")

    return (
        <Link {...rest} viewTransition={viewTransition} className={classes}>
            {children}
        </Link>
    )
}

export default ButtonLink
