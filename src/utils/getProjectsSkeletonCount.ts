import projectsPageSize from "@/utils/projectsPageSize"

function getProjectsSkeletonCount(total: number, shown: number): number {
    return Math.max(0, Math.min(projectsPageSize, total - shown))
}

export default getProjectsSkeletonCount
