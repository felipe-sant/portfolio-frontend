import type { ReactNode } from "react"
import css from "@/styles/components/flag.module.css"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

interface FlagProps {
    language: SupportedLanguage
}

const STRIPE_HEIGHT = 16 / 13
const STRIPES = [0, 1, 2, 3, 4, 5, 6]
const STARS = [
    [1.8, 1.6],
    [4.2, 1.6],
    [6.6, 1.6],
    [3, 3.8],
    [5.4, 3.8],
    [1.8, 6],
    [4.2, 6],
    [6.6, 6]
]

const DRAWINGS: Record<SupportedLanguage, ReactNode> = {
    "pt-BR": (
        <>
            <rect width="24" height="16" fill="#009c3b" />
            <polygon points="12,1.5 22,8 12,14.5 2,8" fill="#ffdf00" />
            <circle cx="12" cy="8" r="3.4" fill="#002776" />
        </>
    ),
    en: (
        <>
            <rect width="24" height="16" fill="#ffffff" />
            {STRIPES.map((stripe) => (
                <rect
                    key={stripe}
                    y={stripe * 2 * STRIPE_HEIGHT}
                    width="24"
                    height={STRIPE_HEIGHT}
                    fill="#b22234"
                />
            ))}
            <rect width="10" height={STRIPE_HEIGHT * 7} fill="#3c3b6e" />
            {STARS.map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="0.5" fill="#ffffff" />
            ))}
        </>
    ),
    es: (
        <>
            <rect width="24" height="16" fill="#ffffff" />
            <rect width="8" height="16" fill="#006847" />
            <rect x="16" width="8" height="16" fill="#ce1126" />
            <ellipse cx="12" cy="8" rx="2.2" ry="2" fill="#8c6b3f" />
            <path
                d="M9.8 10.2c1.4 1.2 3 1.2 4.4 0"
                fill="none"
                stroke="#006847"
                strokeWidth="0.6"
            />
        </>
    )
}

function Flag({ language }: FlagProps) {
    return (
        <svg
            className={css.flag}
            viewBox="0 0 24 16"
            width="24"
            height="16"
            aria-hidden="true"
            focusable="false"
        >
            {DRAWINGS[language]}
        </svg>
    )
}

export default Flag
