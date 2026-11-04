import { Fragment } from "react"
import { useTranslation } from "react-i18next"

interface TrajectoryDetailsLineProps {
    details: string[]
}

function TrajectoryDetailsLine({ details }: TrajectoryDetailsLineProps) {
    const { t } = useTranslation("common")

    return details.map((detail, index) => (
        <Fragment key={detail}>
            {index > 0 && <span aria-hidden="true"> {t("symbols.separator")} </span>}
            {detail}
        </Fragment>
    ))
}

export default TrajectoryDetailsLine
