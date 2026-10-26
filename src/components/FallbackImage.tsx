import { useState } from "react"
import type { ComponentPropsWithoutRef } from "react"
import css from "@/styles/components/fallbackImage.module.css"

interface FallbackImageProps extends Omit<ComponentPropsWithoutRef<"img">, "alt" | "onError"> {
    alt: string
    decorative?: boolean
    placeholderClassName?: string
}

function FallbackImage({
    alt,
    decorative = false,
    className,
    placeholderClassName,
    src,
    ...rest
}: FallbackImageProps) {
    const [failedSource, setFailedSource] = useState<string>()
    const classes = [className, css.image].filter(Boolean).join(" ")

    if (failedSource !== undefined && failedSource === src) {
        const placeholderClasses = [className, css.placeholder, placeholderClassName]
            .filter(Boolean)
            .join(" ")

        return decorative ? (
            <div className={placeholderClasses} aria-hidden="true" />
        ) : (
            <div className={placeholderClasses} role={"img"} aria-label={alt} />
        )
    }

    return (
        <img
            {...rest}
            className={classes}
            alt={alt}
            src={src}
            onError={() => setFailedSource(src ?? "")}
        />
    )
}

export default FallbackImage
