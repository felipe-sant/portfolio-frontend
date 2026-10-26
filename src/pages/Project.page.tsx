import { useTranslation } from "react-i18next"
import { Link, Navigate, useLocation, useParams } from "react-router-dom"
import Icon from "@/components/Icon"
import ProjectDocumentSection from "@/components/ProjectDocumentSection"
import ProjectFacts from "@/components/ProjectFacts"
import ProjectGallery from "@/components/ProjectGallery"
import ProjectLinks from "@/components/ProjectLinks"
import ProjectStack from "@/components/ProjectStack"
import RelatedProjects from "@/components/RelatedProjects"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import usePageTransition from "@/hooks/usePageTransition"
import NotFoundPage from "@/pages/NotFound.page"
import useBackToProjects from "@/pages/hooks/useBackToProjects"
import useProject from "@/pages/hooks/useProject"
import useProjectDocument from "@/pages/hooks/useProjectDocument"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/project.module.css"
import type ProjectDetail from "@/types/project/ProjectDetail.types"

interface ProjectContentProps {
    project: ProjectDetail
    documentName?: string
}

interface MetaItemProps {
    text: string
    hasSeparator: boolean
}

function BackBar() {
    const { t } = useTranslation("project")
    const { to, onClick } = useBackToProjects()
    const viewTransition = usePageTransition()

    return (
        <Link className={css.back} to={to} onClick={onClick} viewTransition={viewTransition}>
            <Icon name="arrowLeft" />
            {t("backToProjects")}
        </Link>
    )
}

function MetaItem({ text, hasSeparator }: MetaItemProps) {
    const { t } = useTranslation("common")

    return (
        <>
            {hasSeparator && <span aria-hidden="true"> {t("symbols.separator")} </span>}
            {text}
        </>
    )
}

function ProjectContent({ project, documentName }: ProjectContentProps) {
    const { t } = useTranslation(["project", "common"])
    const location = useLocation()
    const localizedPath = useLocalizedPath()
    const document = useProjectDocument(project, documentName)

    if (document.status === "notFound") {
        return <NotFoundPage />
    }

    if (documentName !== undefined && document.exactName && document.exactName !== documentName) {
        return (
            <Navigate
                replace
                to={{
                    pathname: localizedPath(ROUTES.projectDocument, {
                        id: project.id,
                        name: document.exactName
                    }),
                    search: location.search,
                    hash: location.hash
                }}
            />
        )
    }

    const labelItems = [
        ...project.types.map((type) => t(`common:projectType.${type}`)),
        project.date.slice(0, 4)
    ]
    const isReadme = document.exactName === "README.md"
    const title = isReadme
        ? t("project:meta.title", { project: project.title })
        : t("project:meta.documentTitle", {
              document: document.exactName,
              project: project.title
          })

    return (
        <>
            <title>{title}</title>
            <meta name="description" content={project.summary} />
            <div className={css.container}>
                <BackBar />
                <header className={css.header}>
                    <div className={css.badges}>
                        {project.featured && (
                            <span className={css.featured}>
                                <Icon name="star" size={12} />
                                {t("common:projectCard.featured")}
                            </span>
                        )}
                        <span className={css.category}>
                            {t(`common:projectCategory.${project.category}`)}
                        </span>
                        <p className={css.label}>
                            {labelItems.map((item, position) => (
                                <MetaItem
                                    key={`${item}-${position}`}
                                    text={item}
                                    hasSeparator={position > 0}
                                />
                            ))}
                        </p>
                    </div>
                    <h1 tabIndex={-1} className={css.heading}>
                        {project.title}
                    </h1>
                    <p className={css.summary}>{project.summary}</p>
                </header>
                <div className={css.grid}>
                    <div className={css.gallery}>
                        <ProjectGallery key={project.id} images={project.images} />
                    </div>
                    <div className={css.aside}>
                        <ProjectFacts project={project} />
                        <ProjectStack stack={project.stack} />
                        <ProjectLinks
                            title={project.title}
                            demoUrl={project.demoUrl}
                            repositoryUrl={project.repositoryUrl}
                        />
                    </div>
                    <div className={css.documents}>
                        <ProjectDocumentSection project={project} state={document} />
                    </div>
                </div>
                <RelatedProjects related={project.related} />
            </div>
        </>
    )
}

function ProjectPage() {
    const { name } = useParams()
    const { status, project } = useProject()

    if (status === "notFound") {
        return <NotFoundPage />
    }

    if (status === "success" && project) {
        return <ProjectContent project={project} documentName={name} />
    }

    return <BackBar />
}

export default ProjectPage
