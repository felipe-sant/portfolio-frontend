import { useId, useState } from "react"
import Icon from "@/components/Icon"
import useMotion from "@/hooks/useMotion"
import css from "@/styles/components/stackMarquee.module.css"
import type StackEntry from "@/types/home/StackEntry.types"

interface StackMarqueeProps {
    items: StackEntry[]
    heading: string
    pauseLabel: string
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

function StackMarquee({ items, heading, pauseLabel }: StackMarqueeProps) {
    const headingId = useId()
    const { motion } = useMotion()
    const [isPaused, setIsPaused] = useState(false)
    const isAnimated = motion === "full"
    const trackClasses = [css.track, isAnimated && isPaused ? css.paused : undefined]
        .filter(Boolean)
        .join(" ")

    return (
        <section data-surface="band" className={css.band} aria-labelledby={headingId}>
            <h2 id={headingId} className={css.srOnly}>
                {heading}
            </h2>
            {isAnimated ? (
                <div className={css.controls}>
                    <button
                        type="button"
                        className={css.pauseButton}
                        aria-label={pauseLabel}
                        aria-pressed={isPaused}
                        onClick={() => setIsPaused((current) => !current)}
                    >
                        <Icon name={isPaused ? "play" : "pause"} size={20} />
                    </button>
                </div>
            ) : null}
            <div className={trackClasses}>
                <StackList items={items} />
                {isAnimated ? <StackList items={items} isHidden /> : null}
            </div>
        </section>
    )
}

export default StackMarquee
