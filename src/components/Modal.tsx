import { useId, useRef } from "react"
import type { ReactNode } from "react"
import { createPortal } from "react-dom"
import IconButton from "@/components/IconButton"
import useModalBehavior from "@/hooks/useModalBehavior"
import css from "@/styles/components/modal.module.css"

interface ModalProps {
    isOpen: boolean
    title: string
    closeLabel: string
    onClose: () => void
    children: ReactNode
    footer?: ReactNode
    description?: string
    subtitle?: ReactNode
}

function Modal({
    isOpen,
    title,
    closeLabel,
    onClose,
    children,
    footer,
    description,
    subtitle
}: ModalProps) {
    const titleId = useId()
    const boxRef = useRef<HTMLDivElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const pressStartedOnBackdrop = useRef(false)

    useModalBehavior({ isOpen, onClose, boxRef, titleRef })

    if (!isOpen) {
        return null
    }

    const heading = (
        <h2 ref={titleRef} id={titleId} tabIndex={-1} className={css.title}>
            {title}
        </h2>
    )

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
                aria-labelledby={titleId}
                aria-describedby={description}
                className={css.box}
            >
                <div className={css.header}>
                    {subtitle ? (
                        <div className={css.headings}>
                            {heading}
                            <div className={css.subtitle}>{subtitle}</div>
                        </div>
                    ) : (
                        heading
                    )}
                    <IconButton icon="close" label={closeLabel} onClick={onClose} />
                </div>
                <div className={css.body}>{children}</div>
                {footer && <div className={css.footer}>{footer}</div>}
            </div>
        </div>,
        document.body
    )
}

export default Modal
