import ProjectCard from "@/components/ProjectCard"
import ProjectCardSkeleton from "@/components/ProjectCardSkeleton"
import css from "@/styles/components/projectsGrid.module.css"
import type ProjectSummary from "@/types/project/ProjectSummary.types"
import projectsPageSize from "@/utils/projectsPageSize"

interface ProjectsGridProps {
    projects: ProjectSummary[]
    skeletonCount: number
}

interface SkeletonItemsProps {
    count: number
}

interface ProjectListItemProps {
    project: ProjectSummary
    index: number
}

function SkeletonItems({ count }: SkeletonItemsProps) {
    return Array.from({ length: count }, (_value, index) => (
        <li key={index} className={css.item} aria-hidden="true">
            <ProjectCardSkeleton />
        </li>
    ))
}

function ProjectListItem({ project, index }: ProjectListItemProps) {
    return (
        <li className={css.item}>
            <ProjectCard
                project={project}
                index={index}
                revealIndex={index % projectsPageSize}
                fromProjects
            />
        </li>
    )
}

function ProjectsGrid({ projects, skeletonCount }: ProjectsGridProps) {
    return (
        <ul className={css.grid}>
            {projects.map((project, index) => (
                <ProjectListItem key={project.id} project={project} index={index} />
            ))}
            <SkeletonItems count={skeletonCount} />
        </ul>
    )
}

export default ProjectsGrid
