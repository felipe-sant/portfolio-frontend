import { useDeferredValue } from "react"
import { useTranslation } from "react-i18next"
import type useProjectsPages from "@/pages/hooks/useProjectsPages"
import projectsElementIds from "@/utils/projectsElementIds"
import splitExperiments from "@/utils/splitExperiments"

type ProjectsPages = Pick<
    ReturnType<typeof useProjectsPages>,
    "hasData" | "isLoading" | "isError" | "total" | "shown" | "items" | "availableTypes"
> & { retry: () => Promise<unknown> }

function useProjectsResults(pages: ProjectsPages, hasFilters: boolean) {
    const { t } = useTranslation("projects")

    const isEmptyContent =
        pages.hasData && pages.total === 0 && !hasFilters && pages.availableTypes.length === 0
    const isNoResults = pages.hasData && pages.total === 0 && !isEmptyContent

    function retry() {
        document.getElementById(projectsElementIds.heading)?.focus()
        return pages.retry()
    }

    function buildResultsText() {
        if (pages.isError) {
            return ""
        }

        if (pages.isLoading) {
            return t("results.loading")
        }

        if (!pages.hasData) {
            return ""
        }

        return pages.total === 0
            ? t("results.countNone")
            : t("results.count", { count: pages.total, shown: pages.shown })
    }

    const { main: mainItems, experiments: experimentItems } = splitExperiments(pages.items)
    const currentText = buildResultsText()
    const text = useDeferredValue(currentText, pages.hasData ? currentText : "")

    return {
        text,
        isEmptyContent,
        isNoResults,
        canClearFilters: hasFilters && !pages.isLoading && !pages.isError && !isNoResults,
        mainItems,
        experimentItems,
        retry
    }
}

export default useProjectsResults
