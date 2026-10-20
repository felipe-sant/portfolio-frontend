import { type AnimationEvent, type ReactNode, useState } from "react"
import useMotion from "@/hooks/useMotion"
import css from "@/styles/components/skeletonSwap.module.css"

interface SkeletonSwapProps {
    isLoading: boolean
    skeleton: ReactNode
    children: ReactNode
}

function SkeletonSwap({ isLoading, skeleton, children }: SkeletonSwapProps) {
    const { motion } = useMotion()
    const [isOverlayGone, setIsOverlayGone] = useState(!isLoading)

    if (isLoading && isOverlayGone) {
        setIsOverlayGone(false)
    }

    if (!isLoading && motion !== "full" && !isOverlayGone) {
        setIsOverlayGone(true)
    }

    if (isLoading) {
        return <>{skeleton}</>
    }

    const showOverlay = motion === "full" && !isOverlayGone

    const handleOverlayEnd = (event: AnimationEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            setIsOverlayGone(true)
        }
    }

    return (
        <div className={css.swap}>
            <div className={showOverlay ? css.entering : undefined}>{children}</div>
            {showOverlay && (
                <div
                    className={css.overlay}
                    aria-hidden="true"
                    inert
                    onAnimationEnd={handleOverlayEnd}
                >
                    {skeleton}
                </div>
            )}
        </div>
    )
}

export default SkeletonSwap
