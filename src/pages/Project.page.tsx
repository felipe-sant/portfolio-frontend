import { useTranslation } from "react-i18next"
import { Link, Navigate, useLocation, useParams } from "react-router-dom"
import Icon from "@/components/Icon"
import JsonLd from "@/components/JsonLd"
import PageMeta from "@/components/PageMeta"
import ProjectError from "@/components/ProjectError"
import ProjectDocumentSection from "@/components/ProjectDocumentSection"
import ProjectFacts from "@/components/ProjectFacts"
import ProjectGallery from "@/components/ProjectGallery"
import ProjectLinks from "@/components/ProjectLinks"
import ProjectStack from "@/components/ProjectStack"
import ProjectSkeleton from "@/components/ProjectSkeleton"
import RelatedProjects from "@/components/RelatedProjects"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import usePageTransition from "@/hooks/usePageTransition"
import NotFoundPage from "@/pages/NotFound.page"
import useBackToProjects from "@/pages/hooks/useBackToProjects"
import useProject from "@/pages/hooks/useProject"
import useProjectDocument from "@/pages/hooks/useProjectDocument"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/project.module.css"
import buildDocumentJsonLd from "@/utils/buildDocumentJsonLd"
import buildProjectJsonLd from "@/utils/buildProjectJsonLd"
import findDocumentByName from "@/utils/findDocumentByName"
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

function ProjectDetailView({ project, documentName }: ProjectContentProps) {
    const { t, i18n } = useTranslation(["project", "common"])
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    const document = useProjectDocument(project, documentName)
    const typeLabels = project.types.map((type) => t(`common:projectType.${type}`))
    const labelItems = [...typeLabels, project.date.slice(0, 4)]
    const firstImage = project.images[0]
    const documentEntry = document.document
    const isDocumentPage = documentEntry !== undefined && documentEntry.name !== "README.md"
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
            <PageMeta
                title={title}
                description={project.summary}
                path={isDocumentPage ? ROUTES.projectDocument : ROUTES.project}
                params={
                    isDocumentPage
                        ? { id: project.id, name: documentEntry.name }
                        : { id: project.id }
                }
                type="article"
                image={firstImage?.large.src}
                imageAlt={firstImage?.alt}
                imageWidth={firstImage?.large.width}
                imageHeight={firstImage?.large.height}
            />
            <JsonLd data={buildProjectJsonLd(language, project, typeLabels)} />
            {isDocumentPage && (
                <JsonLd data={buildDocumentJsonLd(language, project, documentEntry)} />
            )}
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
        </>
    )
}

function ProjectPage() {
    const { name } = useParams()
    const location = useLocation()
    const localizedPath = useLocalizedPath()
    const { status, project, fallbackTitle, retry } = useProject()

    if (status === "notFound") {
        return <NotFoundPage />
    }

    if (status === "success" && project) {
        const document = findDocumentByName(project.documents, name)

        if (!document) {
            return <NotFoundPage />
        }

        if (name !== undefined && document.name !== name) {
            return (
                <Navigate
                    replace
                    to={{
                        pathname: localizedPath(ROUTES.projectDocument, {
                            id: project.id,
                            name: document.name
                        }),
                        search: location.search,
                        hash: location.hash
                    }}
                />
            )
        }
    }

    return (
        <div className={css.container}>
            {!project && <title>{fallbackTitle}</title>}
            <BackBar />
            {project && <ProjectDetailView project={project} documentName={name} />}
            {!project && status === "error" && <ProjectError onRetry={retry} />}
            {!project && status !== "error" && <ProjectSkeleton />}
        </div>
    )
}

export default ProjectPage
