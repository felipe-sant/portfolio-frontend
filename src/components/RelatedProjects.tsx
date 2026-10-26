import { useTranslation } from "react-i18next"
import ButtonLink from "@/components/ButtonLink"
import Icon from "@/components/Icon"
import ProjectCard from "@/components/ProjectCard"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import ROUTES from "@/routers/paths"
import css from "@/styles/components/relatedProjects.module.css"
import type RelatedProjectType from "@/types/project/RelatedProject.types"

interface RelatedProjectsProps {
    related: RelatedProjectType[]
}

interface RelatedItemProps {
    item: RelatedProjectType
    index: number
}

function RelatedItem({ item, index }: RelatedItemProps) {
    return (
        <li className={css.item}>
            <ProjectCard
                project={item.project}
                index={index}
                revealIndex={index}
                headingLevel={3}
                reason={item.reason}
                prioritizeImage={false}
            />
        </li>
    )
}

function RelatedProjects({ related }: RelatedProjectsProps) {
    const { t } = useTranslation("project")
    const localizedPath = useLocalizedPath()

    if (related.length === 0) {
        return null
    }

    return (
        <section className={css.related}>
            <div className={css.header}>
                <h2 className={css.heading}>{t("related.heading")}</h2>
                <ButtonLink
                    to={localizedPath(ROUTES.projects)}
                    variant="secondary"
                    size="sm"
                    aria-label={t("related.viewAllName")}
                >
                    {t("related.viewAll")}
                    <Icon name="arrowRight" />
                </ButtonLink>
            </div>
            <ul className={css.grid}>
                {related.map((item, index) => (
                    <RelatedItem key={item.project.id} item={item} index={index} />
                ))}
            </ul>
        </section>
    )
}

export default RelatedProjects
