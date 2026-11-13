import { useTranslation } from "react-i18next"
import ProjectsGrid from "@/components/ProjectsGrid"
import css from "@/styles/components/projectsExperiments.module.css"
import type ProjectSummary from "@/types/project/ProjectSummary.types"

interface ProjectsExperimentsProps {
    projects: ProjectSummary[]
    firstIndex: number
    skeletonCount: number
}

function ProjectsExperiments({ projects, firstIndex, skeletonCount }: ProjectsExperimentsProps) {
    const { t } = useTranslation("projects")

    return (
        <section className={css.experiments}>
            <h2 className={css.experimentsHeading}>{t("experiments.heading")}</h2>
            <p className={css.experimentsDescription}>{t("experiments.description")}</p>
            <ProjectsGrid
                projects={projects}
                firstIndex={firstIndex}
                headingLevel={3}
                skeletonCount={skeletonCount}
            />
        </section>
    )
}

export default ProjectsExperiments
