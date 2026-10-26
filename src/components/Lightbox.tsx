import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"
import { createPortal } from "react-dom"
import FallbackImage from "@/components/FallbackImage"
import IconButton from "@/components/IconButton"
import useModalBehavior from "@/hooks/useModalBehavior"
import css from "@/styles/components/lightbox.module.css"
import type ProjectImage from "@/types/project/ProjectImage.types"
import publicUrl from "@/utils/publicUrl"

interface LightboxProps {
    images: ProjectImage[]
    activeIndex: number
    isOpen: boolean
    onClose: () => void
    onChange: (index: number) => void
}

interface CaptionProps {
    caption?: string
    counter?: string
}

function Caption({ caption, counter }: CaptionProps) {
    const { t } = useTranslation("common")

    return (
        <p className={css.caption} aria-live="polite">
            {caption}
            {caption && counter && <span aria-hidden="true"> {t("symbols.separator")} </span>}
            {counter}
        </p>
    )
}

function Lightbox({ images, activeIndex, isOpen, onClose, onChange }: LightboxProps) {
    const { t } = useTranslation("project")
    const boxRef = useRef<HTMLDivElement>(null)
    const closeRef = useRef<HTMLButtonElement>(null)
    const pressStartedOnBackdrop = useRef(false)
    const total = images.length
    const hasMany = total > 1

    useModalBehavior({ isOpen, onClose, boxRef, titleRef: closeRef })

    useEffect(() => {
        if (!isOpen || !hasMany) {
            return
        }

        function handleArrow(event: KeyboardEvent) {
            if (event.key === "ArrowRight") {
                onChange((activeIndex + 1) % total)
            } else if (event.key === "ArrowLeft") {
                onChange((activeIndex - 1 + total) % total)
            }
        }

        document.addEventListener("keydown", handleArrow)

        return () => document.removeEventListener("keydown", handleArrow)
    }, [isOpen, hasMany, activeIndex, total, onChange])

    const image = images[activeIndex]

    if (!isOpen || !image) {
        return null
    }

    return createPortal(
        <div
            role="presentation"
            className={css.backdrop}
            onMouseDown={(event) => {
                pressStartedOnBackdrop.current = event.target === event.currentTarget
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget && pressStartedOnBackdrop.current) {
                    onClose()
                }

                pressStartedOnBackdrop.current = false
            }}
        >
            <div
                ref={boxRef}
                role={"dialog"}
                aria-modal="true"
                aria-label={t("lightbox.label")}
                className={css.box}
            >
                <div className={css.bar}>
                    <Caption
                        caption={image.caption}
                        counter={
                            hasMany
                                ? t("gallery.counter", { current: activeIndex + 1, total })
                                : undefined
                        }
                    />
                    <IconButton
                        ref={closeRef}
                        icon="close"
                        label={t("lightbox.close")}
                        onClick={onClose}
                    />
                </div>
                <div className={css.stage}>
                    <FallbackImage
                        className={css.image}
                        placeholderClassName={css.imagePlaceholder}
                        alt={image.alt}
                        src={publicUrl(image.large.src)}
                        width={image.large.width}
                        height={image.large.height}
                    />
                    {hasMany && (
                        <>
                            <IconButton
                                className={`${css.nav} ${css.previous}`}
                                icon="arrowLeft"
                                label={t("lightbox.previous")}
                                onClick={() => onChange((activeIndex - 1 + total) % total)}
                            />
                            <IconButton
                                className={`${css.nav} ${css.next}`}
                                icon="arrowRight"
                                label={t("lightbox.next")}
                                onClick={() => onChange((activeIndex + 1) % total)}
                            />
                        </>
                    )}
                </div>
            </div>
        </div>,
        document.body
    )
}

export default Lightbox
