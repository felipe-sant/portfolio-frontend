import { Fragment } from "react"
import type { Ref } from "react"
import { useTranslation } from "react-i18next"
import TrajectoryDetail from "@/components/TrajectoryDetail"
import TrajectoryPeriod from "@/components/TrajectoryPeriod"
import css from "@/styles/components/trajectoryItem.module.css"
import type TimelineItem from "@/types/timeline/TimelineItem.types"
import getTrajectoryLines from "@/utils/getTrajectoryLines"

interface TrajectoryItemProps {
    item: TimelineItem
    onOpen: (item: TimelineItem) => void
    ref?: Ref<HTMLButtonElement>
}

function TrajectoryItem({ item, onOpen, ref }: TrajectoryItemProps) {
    const { t } = useTranslation("common")
    const lines = getTrajectoryLines(item)

    return (
        <li className={css.item}>
            <button
                ref={ref}
                type="button"
                aria-haspopup="dialog"
                className={css.button}
                onClick={() => onOpen(item)}
            >
                <span className={css.text}>
                    <span className={css.highlight}>{lines.highlight}</span>
                    {lines.details.length > 0 && (
                        <span className={css.details}>
                            {lines.details.map((detail, index) => (
                                <Fragment key={detail}>
                                    {index > 0 && (
                                        <span aria-hidden="true"> {t("symbols.separator")} </span>
                                    )}
                                    {detail}
                                </Fragment>
                            ))}
                        </span>
                    )}
                </span>
                <TrajectoryPeriod start={item.start} end={item.end} />
            </button>
            <div hidden>
                <TrajectoryDetail item={item} />
            </div>
        </li>
    )
}

export default TrajectoryItem
