import { useDeferredValue, useState } from "react"
import { useTranslation } from "react-i18next"
import useDragScroll from "@/hooks/useDragScroll"
import useLanguage from "@/hooks/useLanguage"
import useShareImage from "@/hooks/useShareImage"
import useProjectsFilterOptions from "@/pages/hooks/useProjectsFilterOptions"
import useProjectsFilters from "@/pages/hooks/useProjectsFilters"
import useProjectsPages from "@/pages/hooks/useProjectsPages"
import useProjectsSeo from "@/pages/hooks/useProjectsSeo"
import buildProjectsQueryArgs from "@/utils/buildProjectsQueryArgs"
import projectsElementIds from "@/utils/projectsElementIds"
import splitExperiments from "@/utils/splitExperiments"

function useProjects() {
    const shareImage = useShareImage("projects")
    const { t } = useTranslation(["projects", "common"])
    const language = useLanguage()
    const {
        filters,
        draft,
        setDraft,
        clearSearch,
        clearFilters,
        setType,
        setCategory,
        applyModalFilters,
        hasFilters
    } = useProjectsFilters()
    const { ref: filtersRef, dragProps: filtersDragProps } = useDragScroll<HTMLDivElement>()
    const pages = useProjectsPages(buildProjectsQueryArgs(language, filters))

    const [isFiltersOpen, setIsFiltersOpen] = useState(false)

    function openFilters() {
        setIsFiltersOpen(true)
    }

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

    const filterOptions = useProjectsFilterOptions(filters, pages.availableTypes)
    const seo = useProjectsSeo(pages.firstPageItems)
    const { main: mainItems, experiments: experimentItems } = splitExperiments(pages.items)
    const currentResultsText = buildResultsText()
    const resultsText = useDeferredValue(
        currentResultsText,
        pages.hasData ? currentResultsText : ""
    )

    return {
        shareImage,
        t,
        ids: projectsElementIds,
        seo,
        filters,
        filtersRef,
        filtersDragProps,
        draft,
        setDraft,
        clearSearch,
        clearFilters,
        setType,
        setCategory,
        applyModalFilters,
        hasFilters,
        ...filterOptions,
        isFiltersOpen,
        openFilters,
        closeFilters: () => setIsFiltersOpen(false),
        resultsText,
        isEmptyContent,
        isNoResults,
        ...pages,
        mainItems,
        experimentItems,
        retry
    }
}

export default useProjects
