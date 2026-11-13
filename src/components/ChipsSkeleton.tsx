import Skeleton from "@/components/Skeleton"
import css from "@/styles/components/chipsSkeleton.module.css"

function ChipsSkeleton() {
    return (
        <div className={css.chips}>
            <Skeleton shape="title" width="short" />
            <Skeleton shape="title" width="short" />
            <Skeleton shape="title" width="short" />
        </div>
    )
}

export default ChipsSkeleton
