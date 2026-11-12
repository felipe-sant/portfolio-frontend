import { useTranslation } from "react-i18next"
import Modal from "@/components/Modal"
import ResumePdfPages from "@/components/ResumePdfPages"
import useLanguage from "@/hooks/useLanguage"
import useResumeViewerMode from "@/hooks/useResumeViewerMode"
import css from "@/styles/components/resumeModal.module.css"
import getResumePath from "@/utils/getResumePath"

interface ResumeModalProps {
    isOpen: boolean
    onClose: () => void
}

function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
    const { t } = useTranslation("common")
    const viewerMode = useResumeViewerMode()
    const language = useLanguage()

    if (!isOpen) {
        return null
    }

    const pdfPath = getResumePath(language)

    return (
        <Modal
            isOpen
            large
            title={t("resume.modal.title")}
            closeLabel={t("resume.modal.close")}
            onClose={onClose}
            footer={
                <div className={css.actions}>
                    <a href={pdfPath} download className={css.link}>
                        {t("resume.modal.download")}
                    </a>
                    <a
                        href={getResumePath(language, "md")}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={css.link}
                    >
                        {t("resume.modal.viewText")}
                    </a>
                </div>
            }
        >
            {viewerMode === "native" ? (
                // oxlint-disable-next-line react/iframe-missing-sandbox
                <iframe src={pdfPath} title={t("resume.modal.pdfTitle")} className={css.frame} />
            ) : (
                <ResumePdfPages key={pdfPath} url={pdfPath} />
            )}
        </Modal>
    )
}

export default ResumeModal
