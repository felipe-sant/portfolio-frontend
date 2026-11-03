import { useTranslation } from "react-i18next"
import Chip from "@/components/Chip"
import GroupCount from "@/components/GroupCount"
import css from "@/styles/components/stackGroupList.module.css"
import type StackGroup from "@/types/content/StackGroup.types"

interface StackGroupListProps {
    groups: StackGroup[]
}

interface StackGroupProps {
    group: StackGroup
}

function StackGroupBlock({ group }: StackGroupProps) {
    const { t } = useTranslation("common")

    return (
        <div className={css.group}>
            <div className={css.header}>
                <h3 className={css.heading}>{t(`stackCategory.${group.category}`)}</h3>
                <GroupCount count={group.items.length} countKey="stack.count" />
            </div>
            <ul className={css.chips}>
                {group.items.map((item) => (
                    <li key={item.name}>
                        <Chip>{item.name}</Chip>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function StackGroupList({ groups }: StackGroupListProps) {
    if (groups.length === 0) {
        return null
    }

    return (
        <div className={css.groups}>
            {groups.map((group) => (
                <StackGroupBlock key={group.category} group={group} />
            ))}
        </div>
    )
}

export default StackGroupList
