import Skeleton from "@/components/Skeleton"
import css from "@/styles/components/projectSkeleton.module.css"

function ProjectSkeleton() {
    return (
        <div className={css.skeleton}>
            <Skeleton shape="title" width="medium" announce />
            <Skeleton width="full" />
            <Skeleton shape="media" />
            <Skeleton width="short" />
        </div>
    )
}

export default ProjectSkeleton
