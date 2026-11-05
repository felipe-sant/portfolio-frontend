import { useTranslation } from "react-i18next"
import Spinner from "@/components/Spinner"
import usePdfPages from "@/hooks/usePdfPages"
import css from "@/styles/components/resumePdfPages.module.css"

interface ResumePdfPagesProps {
    url: string
}

interface ResumePdfPageProps {
    index: number
    total: number
    registerCanvas: (index: number) => (node: HTMLCanvasElement | null) => void
}

function ResumePdfPage({ index, total, registerCanvas }: ResumePdfPageProps) {
    const { t } = useTranslation("common")

    return (
        <canvas
            ref={registerCanvas(index)}
            role={"img"}
            aria-label={t("resume.modal.pageLabel", { page: index + 1, total })}
            className={css.page}
        />
    )
}

function ResumePdfPages({ url }: ResumePdfPagesProps) {
    const { t } = useTranslation("common")
    const { status, pageCount, attachRegion, registerCanvas } = usePdfPages(url)

    if (status === "error") {
        return <p className={css.fallback}>{t("resume.modal.noViewer")}</p>
    }

    return (
        <div className={css.pages}>
            {status === "loading" && (
                <p role={"status"} className={css.loading}>
                    <Spinner />
                    {t("resume.modal.loading")}
                </p>
            )}
            {status === "ready" && <p className={css.hint}>{t("resume.modal.canvasHint")}</p>}
            {pageCount > 0 && (
                <section
                    ref={attachRegion}
                    aria-label={t("resume.modal.pagesLabel")}
                    // oxlint-disable-next-line jsx-a11y/no-noninteractive-tabindex
                    tabIndex={0}
                    className={status === "ready" ? css.region : css.regionPending}
                >
                    {Array.from({ length: pageCount }, (_, index) => (
                        <ResumePdfPage
                            key={index}
                            index={index}
                            total={pageCount}
                            registerCanvas={registerCanvas}
                        />
                    ))}
                </section>
            )}
        </div>
    )
}

export default ResumePdfPages
