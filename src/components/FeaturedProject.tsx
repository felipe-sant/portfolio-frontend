import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import Chip from "@/components/Chip"
import usePageTransition from "@/hooks/usePageTransition"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import useReveal from "@/hooks/useReveal"
import css from "@/styles/components/featuredProject.module.css"
import type ProjectSummary from "@/types/project/ProjectSummary.types"
import formatProjectMeta from "@/utils/formatProjectMeta"
import publicUrl from "@/utils/publicUrl"

interface FeaturedProjectProps {
    project: ProjectSummary
    index: number
    viewProjectLabel: string
}

function FeaturedProject({ project, index, viewProjectLabel }: FeaturedProjectProps) {
    const { t } = useTranslation("common")
    const { ref, revealProps } = useReveal<HTMLElement>(index)
    const localizedPath = useLocalizedPath()
    const viewTransition = usePageTransition()
    const { types, category, year } = formatProjectMeta(project)
    const metaItems = [
        ...types.map((type) => t(`projectType.${type}`)),
        t(`projectCategory.${category}`),
        year
    ]
    const cover = project.cover

    return (
        <article
            ref={ref}
            {...revealProps}
            className={css.item}
            data-mirrored={index % 2 === 1 ? "true" : undefined}
        >
            <div className={css.media}>
                {cover ? (
                    <img
                        className={css.image}
                        alt={""}
                        src={publicUrl(cover.small.src)}
                        srcSet={`${publicUrl(cover.small.src)} ${cover.small.width}w, ${publicUrl(cover.large.src)} ${cover.large.width}w`}
                        sizes="(min-width: 640px) 50vw, 100vw"
                        width={cover.large.width}
                        height={cover.large.height}
                        loading="lazy"
                        decoding="async"
                    />
                ) : (
                    <div className={css.placeholder} aria-hidden="true" />
                )}
            </div>
            <div className={css.body}>
                <p className={css.meta}>
                    {metaItems.map((item, position) => (
                        <Fragment key={`${item}-${position}`}>
                            {position > 0 && (
                                <span aria-hidden="true"> {t("symbols.separator")} </span>
                            )}
                            {item}
                        </Fragment>
                    ))}
                </p>
                <h3 className={css.title}>
                    <Link
                        className={css.link}
                        to={localizedPath("/projects/:id", { id: project.id })}
                        viewTransition={viewTransition}
                    >
                        {project.title}
                    </Link>
                </h3>
                <p className={css.summary}>{project.summary}</p>
                <ul className={css.chips}>
                    {project.cardTechnologies.slice(0, 3).map((technology) => (
                        <li key={technology}>
                            <Chip>{technology}</Chip>
                        </li>
                    ))}
                </ul>
                <span className={css.cta} aria-hidden="true">
                    {viewProjectLabel} {t("symbols.forward")}
                </span>
            </div>
        </article>
    )
}

export default FeaturedProject
