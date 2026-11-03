import type { Ref } from "react"
import TrajectoryDetail from "@/components/TrajectoryDetail"
import TrajectoryDetailsLine from "@/components/TrajectoryDetailsLine"
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
                            <TrajectoryDetailsLine details={lines.details} />
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
