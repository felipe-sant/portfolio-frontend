import ProjectCard from "@/components/ProjectCard"
import ProjectCardSkeleton from "@/components/ProjectCardSkeleton"
import css from "@/styles/components/projectsGrid.module.css"
import type ProjectSummary from "@/types/project/ProjectSummary.types"
import projectsPageSize from "@/utils/projectsPageSize"

interface ProjectsGridProps {
    projects: ProjectSummary[]
    firstIndex?: number
    headingLevel?: 2 | 3
    skeletonCount: number
}

interface SkeletonItemsProps {
    count: number
}

interface ProjectListItemProps {
    project: ProjectSummary
    index: number
    headingLevel?: 2 | 3
}

function SkeletonItems({ count }: SkeletonItemsProps) {
    return Array.from({ length: count }, (_value, index) => (
        <li key={index} className={css.item} aria-hidden="true">
            <ProjectCardSkeleton />
        </li>
    ))
}

function ProjectListItem({ project, index, headingLevel }: ProjectListItemProps) {
    return (
        <li className={css.item}>
            <ProjectCard
                project={project}
                index={index}
                revealIndex={index % projectsPageSize}
                headingLevel={headingLevel}
                fromProjects
            />
        </li>
    )
}

function ProjectsGrid({
    projects,
    firstIndex = 0,
    headingLevel,
    skeletonCount
}: ProjectsGridProps) {
    return (
        <ul className={css.grid}>
            {projects.map((project, index) => (
                <ProjectListItem
                    key={project.id}
                    project={project}
                    index={firstIndex + index}
                    headingLevel={headingLevel}
                />
            ))}
            <SkeletonItems count={skeletonCount} />
        </ul>
    )
}

export default ProjectsGrid
