import { useTranslation } from "react-i18next"
import css from "@/styles/components/skeleton.module.css"
import VisuallyHidden from "@/components/VisuallyHidden"

interface SkeletonProps {
    shape?: "line" | "title" | "media" | "photo"
    width?: "full" | "medium" | "short"
    announce?: boolean
}

function Skeleton({ shape = "line", width = "full", announce = false }: SkeletonProps) {
    const { t } = useTranslation()

    return (
        <>
            <span className={`${css.skeleton} ${css[shape]} ${css[width]}`} aria-hidden="true" />
            {announce && <VisuallyHidden role={"status"}>{t("loading")}</VisuallyHidden>}
        </>
    )
}

export default Skeleton
