import { Trans, useTranslation } from "react-i18next"
import useLanguage from "@/hooks/useLanguage"
import css from "@/styles/components/trajectoryPeriod.module.css"
import formatPeriod from "@/utils/formatPeriod"

interface TrajectoryPeriodProps {
    start: string
    end?: string
}

function TrajectoryPeriod({ start, end }: TrajectoryPeriodProps) {
    const { t } = useTranslation("common")
    const language = useLanguage()
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
