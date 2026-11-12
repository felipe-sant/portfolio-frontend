import type { ReactNode } from "react"
import Reveal from "@/components/Reveal"
import css from "@/styles/components/section.module.css"

interface SectionProps {
    headingId: string
    heading: string
    children: ReactNode
    className?: string
    headingTone?: "label" | "weak"
    headingFocusable?: boolean
    hint?: string
    reveal?: boolean
}

function Section({
    headingId,
    heading,
    children,
    className,
    headingTone = "label",
    headingFocusable = false,
    hint,
    reveal = false
}: SectionProps) {
    const section = (
        <section className={className} aria-labelledby={headingId}>
            <div className={css.container}>
                <h2
                    id={headingId}
                    tabIndex={headingFocusable ? -1 : undefined}
                    className={`${css.heading} ${css[headingTone]}`}
                >
                    {heading}
                </h2>
                {hint && <p className={css.hint}>{hint}</p>}
                {children}
            </div>
        </section>
    )

    return reveal ? <Reveal>{section}</Reveal> : section
}

export default Section
