import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import Chip from "@/components/Chip"
import Icon from "@/components/Icon"
import VisuallyHidden from "@/components/VisuallyHidden"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import usePageTransition from "@/hooks/usePageTransition"
import useReveal from "@/hooks/useReveal"
import ROUTES from "@/routers/paths"
import css from "@/styles/components/projectCard.module.css"
import type ProjectSummary from "@/types/project/ProjectSummary.types"
import formatProjectMeta from "@/utils/formatProjectMeta"
import publicUrl from "@/utils/publicUrl"

interface ProjectCardProps {
    project: ProjectSummary
    index: number
    revealIndex: number
    headingLevel?: 2 | 3
    reason?: string
    prioritizeImage?: boolean
    fromProjects?: boolean
}

interface MetaItemProps {
    text: string
    hasSeparator: boolean
}

const EAGER_IMAGE_COUNT = 3
const IMAGE_SIZES = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"

function MetaItem({ text, hasSeparator }: MetaItemProps) {
    const { t } = useTranslation("common")

    return (
        <>
            {hasSeparator && <span aria-hidden="true"> {t("symbols.separator")} </span>}
            {text}
        </>
    )
}

function ProjectCard({
    project,
    index,
    revealIndex,
    headingLevel = 2,
    reason,
    prioritizeImage = true,
    fromProjects = false
}: ProjectCardProps) {
    const { t } = useTranslation("common")
    const { ref, revealProps } = useReveal<HTMLElement>(revealIndex)
    const localizedPath = useLocalizedPath()
    const viewTransition = usePageTransition()
    const { types, category, year } = formatProjectMeta(project)
    const metaItems = [
        ...types.map((type) => t(`projectType.${type}`)),
        t(`projectCategory.${category}`)
    ]
    const cover = project.cover
    const isEager = prioritizeImage && index < EAGER_IMAGE_COUNT
    const Heading = headingLevel === 3 ? "h3" : "h2"

    return (
        <article ref={ref} {...revealProps} className={css.card} suppressHydrationWarning>
            {cover ? (
                <img
                    className={css.image}
                    alt={""}
                    src={publicUrl(cover.small.src)}
                    srcSet={`${publicUrl(cover.small.src)} ${cover.small.width}w, ${publicUrl(cover.large.src)} ${cover.large.width}w`}
                    sizes={IMAGE_SIZES}
                    width={cover.large.width}
                    height={cover.large.height}
                    loading={isEager ? undefined : "lazy"}
                    decoding={isEager ? undefined : "async"}
                    fetchPriority={prioritizeImage && index === 0 ? "high" : undefined}
                />
            ) : (
                <div className={css.placeholder} aria-hidden="true" />
            )}
            <div className={css.body}>
                {reason && <p className={css.reason}>{reason}</p>}
                <div className={css.titleRow}>
                    <Heading className={css.title}>
                        <Link
                            className={css.link}
                            to={localizedPath(ROUTES.project, { id: project.id })}
                            state={fromProjects ? { fromProjects: true } : undefined}
                            viewTransition={viewTransition}
                        >
                            {project.title}
                        </Link>
                        {project.featured && (
                            <>
                                <span className={css.star} aria-hidden="true">
                                    <Icon name="star" size={14} />
                                </span>
                                <VisuallyHidden>{t("projectCard.featured")}</VisuallyHidden>
                            </>
                        )}
                    </Heading>
                    <time className={css.year} dateTime={project.date}>
                        {year}
                    </time>
                </div>
                <p className={css.meta}>
                    {metaItems.map((item, position) => (
                        <MetaItem
                            key={`${item}-${position}`}
                            text={item}
                            hasSeparator={position > 0}
                        />
                    ))}
                </p>
                <p className={css.summary}>{project.summary}</p>
                <ul className={css.chips}>
                    {project.cardTechnologies.slice(0, 3).map((technology) => (
                        <li key={technology}>
                            <Chip>{technology}</Chip>
                        </li>
                    ))}
                </ul>
            </div>
        </article>
    )
}

export default ProjectCard
