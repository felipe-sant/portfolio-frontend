import type { Ref } from "react"
import { useTranslation } from "react-i18next"
import { Link, useLocation } from "react-router-dom"
import useLocalizedPath from "@/hooks/useLocalizedPath"
import ROUTES from "@/routers/paths"
import css from "@/styles/components/projectDocumentsNav.module.css"
import type ProjectDocument from "@/types/project/ProjectDocument.types"
import readProjectsOrigin from "@/utils/readProjectsOrigin"

interface ProjectDocumentsNavProps {
    projectId: string
    projectTitle: string
    documents: ProjectDocument[]
    current: string
    navRef?: Ref<HTMLElement>
}

const README_NAME = "README.md"

function ProjectDocumentsNav({
    projectId,
    projectTitle,
    documents,
    current,
    navRef
}: ProjectDocumentsNavProps) {
    const { t } = useTranslation("project")
    const localizedPath = useLocalizedPath()
    const location = useLocation()
    const origin = readProjectsOrigin(location.state)
    const nextState = origin && { fromProjects: true, documentSteps: origin.documentSteps + 1 }

    return (
        <nav ref={navRef} className={css.nav} aria-label={t("documents.label")}>
            <ul className={css.list}>
                {documents.map((document) => (
                    <li key={document.id}>
                        <Link
                            className={css.link}
                            to={
                                document.name === README_NAME
                                    ? localizedPath(ROUTES.project, { id: projectId })
                                    : localizedPath(ROUTES.projectDocument, {
                                          id: projectId,
                                          name: document.name
                                      })
                            }
                            state={nextState}
                            preventScrollReset
                            aria-label={t("documents.linkName", {
                                document: document.name,
                                project: projectTitle
                            })}
                            aria-current={document.name === current ? "page" : undefined}
                        >
                            {document.name}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default ProjectDocumentsNav
