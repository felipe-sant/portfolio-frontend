import type { ComponentPropsWithoutRef } from "react"
import { useTranslation } from "react-i18next"
import buttonCss from "@/styles/components/button.module.css"
import css from "@/styles/components/externalButtonLink.module.css"

interface ExternalButtonLinkProps extends Omit<
    ComponentPropsWithoutRef<"a">,
    "target" | "rel" | "href"
> {
    href: string
    variant?: "primary" | "secondary"
    size?: "sm" | "md" | "lg"
}

function ExternalButtonLink({
    href,
    variant = "primary",
    size = "md",
    className,
    children,
    ...rest
}: ExternalButtonLinkProps) {
    const { t } = useTranslation("common")
    const classes = [buttonCss.button, buttonCss[variant], buttonCss[size], css.link, className]
        .filter(Boolean)
        .join(" ")

    return (
        <a {...rest} href={href} target="_blank" rel="noopener noreferrer" className={classes}>
            {children}
            <span aria-hidden="true">{t("symbols.external")}</span>
        </a>
    )
}

export default ExternalButtonLink
