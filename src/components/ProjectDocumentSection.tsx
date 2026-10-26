import { lazy, Suspense, useEffect, useId, useRef } from "react"
import { useTranslation } from "react-i18next"
import LoadError from "@/components/LoadError"
import ProjectDocumentsNav from "@/components/ProjectDocumentsNav"
import Skeleton from "@/components/Skeleton"
import TextDocument from "@/components/TextDocument"
import type useProjectDocument from "@/pages/hooks/useProjectDocument"
import css from "@/styles/components/projectDocumentSection.module.css"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import loadMarkdownRenderer from "@/utils/loadMarkdownRenderer"

interface ProjectDocumentSectionProps {
    project: ProjectDetail
    state: ReturnType<typeof useProjectDocument>
}

const MarkdownRenderer = lazy(loadMarkdownRenderer)

function DocumentSkeleton() {
    return (
        <div className={css.skeleton}>
            <Skeleton shape="line" width="full" announce />
            <Skeleton shape="line" width="full" />
            <Skeleton shape="line" width="medium" />
        </div>
    )
}

function ProjectDocumentSection({ project, state }: ProjectDocumentSectionProps) {
    const { t } = useTranslation("project")
    const titleId = useId()
    const navRef = useRef<HTMLElement>(null)
    const titleRef = useRef<HTMLHeadingElement>(null)
    const documentName = state.document?.name
    const previousName = useRef(documentName)

    useEffect(() => {
        if (previousName.current === documentName) {
            return
        }

        previousName.current = documentName
        const title = titleRef.current

        if (!title) {
            return
        }

        title.focus({ preventScroll: true })
        const navBottom = navRef.current?.getBoundingClientRect().bottom ?? 0

        if (title.getBoundingClientRect().top < navBottom) {
            title.scrollIntoView()
        }
    }, [documentName])

    if (!state.document) {
        return null
    }

    return (
        <section className={css.section}>
            <ProjectDocumentsNav
                navRef={navRef}
                projectId={project.id}
                projectTitle={project.title}
                documents={project.documents}
                current={state.document.name}
            />
            <h2 ref={titleRef} id={titleId} tabIndex={-1} className={css.title}>
                {state.document.name}
            </h2>
            {state.status === "loading" && <DocumentSkeleton />}
            {state.status === "error" && (
                <LoadError
                    title={t("documents.loadError.heading")}
                    description={t("documents.loadError.description")}
                    retryLabel={t("retry")}
                    onRetry={state.retry}
                />
            )}
            {state.status === "success" &&
                state.content !== undefined &&
                state.format === "text" && (
                    <TextDocument content={state.content} labelledBy={titleId} lang={state.lang} />
                )}
            {state.status === "success" &&
                state.content !== undefined &&
                state.format === "markdown" && (
                    <div lang={state.lang}>
                        <Suspense fallback={<DocumentSkeleton />}>
                            <MarkdownRenderer content={state.content} />
                        </Suspense>
                    </div>
                )}
        </section>
    )
}

export default ProjectDocumentSection
