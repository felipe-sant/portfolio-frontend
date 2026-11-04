import { useTranslation } from "react-i18next"
import VisuallyHidden from "@/components/VisuallyHidden"
import css from "@/styles/components/groupCount.module.css"

interface GroupCountProps {
    count: number
    countKey: "stack.count" | "trajectory.count"
}

function GroupCount({ count, countKey }: GroupCountProps) {
    const { t } = useTranslation("about")

    return (
        <>
            <span className={css.count} aria-hidden="true">
                {count}
            </span>
            <VisuallyHidden>{t(countKey, { count })}</VisuallyHidden>
        </>
    )
}

export default GroupCount
