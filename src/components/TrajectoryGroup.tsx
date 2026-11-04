import type { Ref } from "react"
import { useTranslation } from "react-i18next"
import GroupCount from "@/components/GroupCount"
import TrajectoryItem from "@/components/TrajectoryItem"
import css from "@/styles/components/trajectoryGroup.module.css"
import type TimelineGroup from "@/types/timeline/TimelineGroup.types"
import type TimelineItem from "@/types/timeline/TimelineItem.types"

interface TrajectoryGroupProps {
    group: TimelineGroup
    onOpen: (item: TimelineItem) => void
    registerTrigger?: (id: string) => Ref<HTMLButtonElement>
}

function TrajectoryGroup({ group, onOpen, registerTrigger }: TrajectoryGroupProps) {
    const { t } = useTranslation("about")

    if (group.items.length === 0) {
        return null
    }

    return (
        <div className={css.group}>
            <div className={css.header}>
                <h3 className={css.heading}>{t(`trajectory.groups.${group.kind}`)}</h3>
                <GroupCount count={group.items.length} countKey="trajectory.count" />
            </div>
            <ul className={css.items}>
                {group.items.map((item) => (
                    <TrajectoryItem
                        key={item.id}
                        item={item}
                        onOpen={onOpen}
                        ref={registerTrigger?.(item.id)}
                    />
                ))}
            </ul>
        </div>
    )
}

export default TrajectoryGroup
