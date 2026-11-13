import { useState } from "react"
import { useTranslation } from "react-i18next"
import useDragScroll from "@/hooks/useDragScroll"
import useLanguage from "@/hooks/useLanguage"
import useShareImage from "@/hooks/useShareImage"
import useProjectsFilterOptions from "@/pages/hooks/useProjectsFilterOptions"
import useProjectsFilters from "@/pages/hooks/useProjectsFilters"
import useProjectsPages from "@/pages/hooks/useProjectsPages"
import useProjectsResults from "@/pages/hooks/useProjectsResults"
import useProjectsSeo from "@/pages/hooks/useProjectsSeo"
import buildProjectsQueryArgs from "@/utils/buildProjectsQueryArgs"
import projectsElementIds from "@/utils/projectsElementIds"

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

    const filterOptions = useProjectsFilterOptions(filters, pages.availableTypes)
    const seo = useProjectsSeo(pages.firstPageItems)
    const results = useProjectsResults(pages, hasFilters)

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
        resultsText: results.text,
        isEmptyContent: results.isEmptyContent,
        isNoResults: results.isNoResults,
        canClearFilters: results.canClearFilters,
        ...pages,
        mainItems: results.mainItems,
        experimentItems: results.experimentItems,
        retry: results.retry
    }
}

export default useProjects
