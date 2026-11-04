import { useTranslation } from "react-i18next"
import Modal from "@/components/Modal"
import TrajectoryDetail from "@/components/TrajectoryDetail"
import TrajectoryDetailsLine from "@/components/TrajectoryDetailsLine"
import TrajectoryPeriod from "@/components/TrajectoryPeriod"
import css from "@/styles/components/trajectoryModal.module.css"
import type TimelineItem from "@/types/timeline/TimelineItem.types"
import getTrajectoryLines from "@/utils/getTrajectoryLines"

interface TrajectoryModalProps {
    item: TimelineItem | null
    onClose: () => void
}

function TrajectoryModal({ item, onClose }: TrajectoryModalProps) {
    const { t } = useTranslation(["about", "common"])

    if (!item) {
        return null
    }

    const lines = getTrajectoryLines(item)

    return (
        <Modal
            isOpen
            wide
            title={lines.highlight}
            closeLabel={t("about:modal.close")}
            onClose={onClose}
            subtitle={
                <p className={css.meta}>
                    <TrajectoryDetailsLine details={lines.details} />
                    {lines.details.length > 0 && (
                        <span aria-hidden="true"> {t("common:symbols.separator")} </span>
                    )}
                    <TrajectoryPeriod start={item.start} end={item.end} />
                </p>
            }
        >
            <TrajectoryDetail item={item} />
        </Modal>
    )
}

export default TrajectoryModal
