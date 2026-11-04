import Skeleton from "@/components/Skeleton"
import css from "@/styles/components/projectCardSkeleton.module.css"

function ProjectCardSkeleton() {
    return (
        <div className={css.card} aria-hidden="true">
            <Skeleton shape="media" />
            <div className={css.body}>
                <Skeleton shape="title" width="medium" />
                <Skeleton />
                <Skeleton width="medium" />
            </div>
        </div>
    )
}

export default ProjectCardSkeleton
