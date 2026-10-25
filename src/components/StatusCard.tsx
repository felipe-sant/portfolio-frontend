import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import css from "@/styles/components/statusCard.module.css"
import formatSinceDate from "@/utils/formatSinceDate"

interface StatusCardProps {
    variant: "working" | "studying"
    label: string
    title: string
    organization?: string
    stage?: string
    start: string
}

interface JoinedPartsProps {
    parts: (string | undefined)[]
}

function JoinedParts({ parts }: JoinedPartsProps) {
    const { t } = useTranslation("common")
    const present = parts.filter((part): part is string => Boolean(part))

    return present.map((part, index) => (
        <Fragment key={part}>
            {index > 0 && <span aria-hidden="true"> {t("symbols.separator")} </span>}
            {part}
        </Fragment>
    ))
}

function StatusCard({ variant, label, title, organization, stage, start }: StatusCardProps) {
    const { t, i18n } = useTranslation("common")
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    const since = formatSinceDate(start, language)
    const isStudying = variant === "studying"
    const detailLead = isStudying ? stage : organization

    return (
        <div className={css.card}>
            <p className={css.label}>
                {isStudying && <span className={css.indicator} aria-hidden="true" />}
                {label}
            </p>
            <p className={css.highlight}>
                {isStudying ? <JoinedParts parts={[organization, title]} /> : title}
            </p>
            <p className={css.detail}>
                {detailLead && (
                    <>
                        {detailLead}
                        <span aria-hidden="true"> {t("symbols.separator")} </span>
                    </>
                )}
                <time dateTime={since.dateTime}>{t("period.since", { date: since.label })}</time>
            </p>
        </div>
    )
}

export default StatusCard
