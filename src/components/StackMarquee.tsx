import { useId } from "react"
import useDragScroll from "@/hooks/useDragScroll"
import useHoverFocusPause from "@/hooks/useHoverFocusPause"
import useMediaQuery from "@/hooks/useMediaQuery"
import useMotion from "@/hooks/useMotion"
import css from "@/styles/components/stackMarquee.module.css"
import type StackEntry from "@/types/home/StackEntry.types"

interface StackMarqueeProps {
    items: StackEntry[]
    heading: string
}

interface StackListProps {
    items: StackEntry[]
    isHidden?: boolean
}

function StackList({ items, isHidden }: StackListProps) {
    return (
        <ul className={css.list} aria-hidden={isHidden ? "true" : undefined}>
            {items.map((item) => (
                <li key={item.name} className={item.isPrimary ? css.primary : css.item}>
                    {item.name}
                </li>
            ))}
        </ul>
    )
}

const regionTabIndex = 0

function StackMarquee({ items, heading }: StackMarqueeProps) {
    const headingId = useId()
    const { motion } = useMotion()
    const isCoarsePointer = useMediaQuery("(pointer: coarse)")
    const isAnimated = motion === "full" && !isCoarsePointer
    const { ref, dragProps } = useDragScroll<HTMLElement>()
    const { isPaused, pauseProps } = useHoverFocusPause<HTMLElement>()

    return (
        <section
            ref={ref}
            {...dragProps}
            {...pauseProps}
            className={css.band}
            aria-labelledby={headingId}
            tabIndex={regionTabIndex}
            data-paused={isAnimated && isPaused ? "true" : undefined}
        >
            <h2 id={headingId} className={css.srOnly}>
                {heading}
            </h2>
            <div className={css.track}>
                <StackList items={items} />
                {isAnimated ? <StackList items={items} isHidden /> : null}
            </div>
        </section>
    )
}

export default StackMarquee
