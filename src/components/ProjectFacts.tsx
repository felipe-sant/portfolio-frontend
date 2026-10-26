import { Fragment } from "react"
import { useTranslation } from "react-i18next"
import css from "@/styles/components/projectFacts.module.css"
import type ProjectDetail from "@/types/project/ProjectDetail.types"

interface ProjectFactsProps {
    project: ProjectDetail
}

function ProjectFacts({ project }: ProjectFactsProps) {
    const { t } = useTranslation(["project", "common"])

    return (
        <section className={css.facts}>
            <h2 className={css.heading}>{t("project:facts.heading")}</h2>
            <dl className={css.list}>
                <div className={css.pair}>
                    <dt>{t("project:facts.year")}</dt>
                    <dd>
                        <time dateTime={project.date}>{project.date.slice(0, 4)}</time>
                    </dd>
                </div>
                <div className={css.pair}>
                    <dt>{t("project:facts.type")}</dt>
                    <dd>
                        {project.types.map((type, position) => (
                            <Fragment key={type}>
                                {position > 0 && (
                                    <span aria-hidden="true">
                                        {" "}
                                        {t("common:symbols.separator")}{" "}
                                    </span>
                                )}
                                {t(`common:projectType.${type}`)}
                            </Fragment>
                        ))}
                    </dd>
                </div>
                <div className={css.pair}>
                    <dt>{t("project:facts.category")}</dt>
                    <dd>{t(`common:projectCategory.${project.category}`)}</dd>
                </div>
                <div className={css.pair}>
                    <dt>{t("project:facts.role")}</dt>
                    <dd>{project.role}</dd>
                </div>
                <div className={css.pair}>
                    <dt>{t("project:facts.duration")}</dt>
                    <dd>{project.duration}</dd>
                </div>
                <div className={css.pair}>
                    <dt>{t("project:facts.team")}</dt>
                    <dd>{project.team}</dd>
                </div>
                <div className={css.pair}>
                    <dt>{t("project:facts.status")}</dt>
                    <dd className={`${css.status} ${css[project.status]}`}>
                        <span className={css.indicator} aria-hidden="true" />
                        {t(`common:projectStatus.${project.status}`)}
                    </dd>
                </div>
            </dl>
        </section>
    )
}

export default ProjectFacts
