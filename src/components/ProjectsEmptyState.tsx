import type { ReactNode } from "react"
import css from "@/styles/components/projectsEmptyState.module.css"

interface ProjectsEmptyStateProps {
    heading: string
    description: string
    action?: ReactNode
}

function ProjectsEmptyState({ heading, description, action }: ProjectsEmptyStateProps) {
    return (
        <div className={css.emptyBox}>
            <h2 className={css.emptyHeading}>{heading}</h2>
            <p className={css.emptyText}>{description}</p>
            {action}
        </div>
    )
}

export default ProjectsEmptyState
