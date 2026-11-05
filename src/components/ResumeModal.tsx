import { useTranslation } from "react-i18next"
import Modal from "@/components/Modal"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import css from "@/styles/components/resumeModal.module.css"
import getResumePath from "@/utils/getResumePath"

interface ResumeModalProps {
    isOpen: boolean
    onClose: () => void
}

function ResumeModal({ isOpen, onClose }: ResumeModalProps) {
    const { t, i18n } = useTranslation("common")

    if (!isOpen) {
        return null
    }

    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    const pdfPath = getResumePath(language)
    const hasViewer = navigator.pdfViewerEnabled !== false

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
            {hasViewer ? (
                // oxlint-disable-next-line react/iframe-missing-sandbox
                <iframe src={pdfPath} title={t("resume.modal.pdfTitle")} className={css.frame} />
            ) : (
                <p className={css.fallback}>{t("resume.modal.noViewer")}</p>
            )}
        </Modal>
    )
}

export default ResumeModal
