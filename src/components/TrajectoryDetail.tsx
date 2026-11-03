import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import Chip from "@/components/Chip"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import ROUTES from "@/routers/paths"
import css from "@/styles/components/trajectoryDetail.module.css"
import type Certificate from "@/types/timeline/Certificate.types"
import type TimelineItem from "@/types/timeline/TimelineItem.types"
import isUuidV7 from "@/utils/isUuidV7"

interface TrajectoryDetailProps {
    item: TimelineItem
}

interface DetailBlockProps {
    label: string
    children: ReactNode
}

interface CertificateChipProps {
    certificate: Certificate
}

function DetailBlock({ label, children }: DetailBlockProps) {
    return (
        <div className={css.block}>
            <h3 className={css.label}>{label}</h3>
            {children}
        </div>
    )
}

function CertificateChip({ certificate }: CertificateChipProps) {
    const { t } = useTranslation("common")

    return (
        <Chip>
            {certificate.name}
            {certificate.issuer && (
                <>
                    <span aria-hidden="true"> {t("symbols.separator")} </span>
                    {certificate.issuer}
                </>
            )}
        </Chip>
    )
}

function TrajectoryDetail({ item }: TrajectoryDetailProps) {
    const { t } = useTranslation(["about", "common"])
    const localizedPath = useLocalizedPath()
    const isExperience = item.kind === "experience"
    const bullets = isExperience ? item.responsibilities : item.disciplines
    const bulletsLabel = isExperience
        ? t("about:modal.responsibilities")
        : t("about:modal.disciplines")
    const projects = item.projects.filter((project) => project.title && isUuidV7(project.id))

    return (
        <div className={css.detail}>
            <p className={css.summary}>{item.summary}</p>
            {bullets.length > 0 && (
                <DetailBlock label={bulletsLabel}>
                    <ul className={css.bullets}>
                        {bullets.map((bullet) => (
                            <li key={bullet}>{bullet}</li>
                        ))}
                    </ul>
                </DetailBlock>
            )}
            {item.technologies.length > 0 && (
                <DetailBlock label={t("about:modal.technologies")}>
                    <ul className={css.chips}>
                        {item.technologies.map((technology) => (
                            <li key={technology}>
                                <Chip>{technology}</Chip>
                            </li>
                        ))}
                    </ul>
                </DetailBlock>
            )}
            {item.certificates.length > 0 && (
                <DetailBlock label={t("about:modal.certificates")}>
                    <ul className={css.chips}>
                        {item.certificates.map((certificate) => (
                            <li key={certificate.id}>
                                <CertificateChip certificate={certificate} />
                            </li>
                        ))}
                    </ul>
                </DetailBlock>
            )}
            {projects.length > 0 && (
                <DetailBlock label={t("about:modal.relatedProjects")}>
                    <ul className={css.projects}>
                        {projects.map((project) => (
                            <li key={project.id}>
                                <Link
                                    to={localizedPath(ROUTES.project, { id: project.id })}
                                    className={css.projectLink}
                                >
                                    {project.title}
                                    <span aria-hidden="true">{t("common:symbols.forward")}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </DetailBlock>
            )}
        </div>
    )
}

export default TrajectoryDetail
