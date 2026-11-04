import { Trans, useTranslation } from "react-i18next"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import css from "@/styles/components/trajectoryPeriod.module.css"
import formatPeriod from "@/utils/formatPeriod"

interface TrajectoryPeriodProps {
    start: string
    end?: string
}

function TrajectoryPeriod({ start, end }: TrajectoryPeriodProps) {
    const { t, i18n } = useTranslation("common")
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    const period = formatPeriod(start, end, language)

    return (
        <span className={css.wrapper}>
            <span className={css.period}>
                {period.end ? (
                    <Trans
                        t={t}
                        i18nKey="period.range"
                        values={{ start: period.start.label, end: period.end.label }}
                        components={{
                            start: <time dateTime={period.start.dateTime} />,
                            end: <time dateTime={period.end.dateTime} />
                        }}
                    />
                ) : (
                    <time dateTime={period.start.dateTime}>
                        {t("period.since", { date: period.start.label })}
                    </time>
                )}
            </span>
            {period.isCurrent && <span className={css.badge}>{t("period.current")}</span>}
        </span>
    )
}

export default TrajectoryPeriod
