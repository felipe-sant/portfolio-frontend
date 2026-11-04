import type { ComponentPropsWithoutRef, MouseEvent } from "react"
import buttonCss from "@/styles/components/button.module.css"
import css from "@/styles/components/resumeLink.module.css"

interface ResumeLinkProps extends Omit<
    ComponentPropsWithoutRef<"a">,
    "onClick" | "download" | "target"
> {
    href: string
    onOpen: (trigger: HTMLAnchorElement) => void
    variant?: "primary" | "secondary"
    size?: "sm" | "md" | "lg"
}

function isPlainClick(event: MouseEvent<HTMLAnchorElement>) {
    return (
        event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey
    )
}

function ResumeLink({
    href,
    onOpen,
    variant,
    size = "md",
    className,
    children,
    ...rest
}: ResumeLinkProps) {
    const classes = [
        variant && buttonCss.button,
        variant && buttonCss[variant],
        variant && buttonCss[size],
        variant && css.buttonLink,
        className
    ]
        .filter(Boolean)
        .join(" ")

    function handleClick(event: MouseEvent<HTMLAnchorElement>) {
        if (!isPlainClick(event)) {
            return
        }

        event.preventDefault()
        onOpen(event.currentTarget)
    }

    return (
        <a {...rest} href={href} className={classes || undefined} onClick={handleClick}>
            {children}
        </a>
    )
}

export default ResumeLink
