import { useTranslation } from "react-i18next"
import Button from "@/components/Button"
import LoadError from "@/components/LoadError"
import css from "@/styles/components/projectsLoadMore.module.css"

interface ProjectsLoadMoreState {
    hasMore: boolean
    isFetchingMore: boolean
    loadMoreError: boolean
    loadMore: () => void
    retryLoadMore: () => void
}

interface ProjectsLoadMoreProps {
    more: ProjectsLoadMoreState
    alertId: string
    isListError: boolean
}

function ProjectsLoadMore({ more, alertId, isListError }: ProjectsLoadMoreProps) {
    const { t } = useTranslation("projects")

    return (
        <>
            {more.loadMoreError && (
                <div className={css.moreError}>
                    <LoadError
                        id={alertId}
                        title={t("loadMoreError.heading")}
                        retryLabel={t("loadMoreError.retry")}
                        onRetry={more.retryLoadMore}
                    />
                </div>
            )}
            {more.hasMore && !isListError && (
                <div className={css.more}>
                    <Button
                        variant="secondary"
                        loading={more.isFetchingMore}
                        onClick={more.loadMore}
                    >
                        {t("loadMore")}
                    </Button>
                </div>
            )}
        </>
    )
}

export default ProjectsLoadMore
