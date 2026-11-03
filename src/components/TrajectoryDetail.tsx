import type { ReactNode } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import CertificateChip from "@/components/CertificateChip"
import Chip from "@/components/Chip"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import ROUTES from "@/routers/paths"
import css from "@/styles/components/trajectoryDetail.module.css"
import type TimelineItem from "@/types/timeline/TimelineItem.types"
import type TimelineProjectRef from "@/types/timeline/TimelineProjectRef.types"
import isUuidV7 from "@/utils/isUuidV7"

interface TrajectoryDetailProps {
    item: TimelineItem
}

interface DetailBlockProps {
    label: string
    children: ReactNode
}

interface RelatedProjectLinkProps {
    project: TimelineProjectRef
}

function DetailBlock({ label, children }: DetailBlockProps) {
    return (
        <div className={css.block}>
            <h3 className={css.label}>{label}</h3>
            {children}
        </div>
    )
}

function RelatedProjectLink({ project }: RelatedProjectLinkProps) {
    const { t } = useTranslation("common")
    const localizedPath = useLocalizedPath()

    return (
        <li>
            <Link
                to={localizedPath(ROUTES.project, { id: project.id })}
                className={css.projectLink}
            >
                {project.title}
                <span aria-hidden="true">{t("symbols.forward")}</span>
            </Link>
        </li>
    )
}

function TrajectoryDetail({ item }: TrajectoryDetailProps) {
    const { t } = useTranslation("about")
    const isExperience = item.kind === "experience"
    const bullets = isExperience ? item.responsibilities : item.disciplines
    const bulletsLabel = isExperience ? t("modal.responsibilities") : t("modal.disciplines")
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
                <DetailBlock label={t("modal.technologies")}>
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
                <DetailBlock label={t("modal.certificates")}>
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
                <DetailBlock label={t("modal.relatedProjects")}>
                    <ul className={css.projects}>
                        {projects.map((project) => (
                            <RelatedProjectLink key={project.id} project={project} />
                        ))}
                    </ul>
                </DetailBlock>
            )}
        </div>
    )
}

export default TrajectoryDetail
