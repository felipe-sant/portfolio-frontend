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
        search: { draft, setDraft, clearSearch },
        filterBar: {
            ref: filtersRef,
            dragProps: filtersDragProps,
            typeValue: filterOptions.typeValue,
            typeOptions: filterOptions.typeOptions,
            categoryOptions: filterOptions.categoryOptions,
            setType,
            setCategory
        },
        modal: {
            isOpen: isFiltersOpen,
            open: openFilters,
            close: () => setIsFiltersOpen(false),
            filtersCount: filterOptions.filtersCount,
            applied: filterOptions.appliedFilters,
            technologyOptions: filterOptions.technologyOptions,
            yearOptions: filterOptions.yearOptions,
            sortOptions: filterOptions.sortOptions,
            applyModalFilters
        },
        results: {
            text: results.text,
            hasFilters,
            canClearFilters: results.canClearFilters,
            isEmptyContent: results.isEmptyContent,
            isNoResults: results.isNoResults,
            clearFilters
        },
        list: {
            isLoading: pages.isLoading,
            isError: pages.isError,
            retry: results.retry,
            mainItems: results.mainItems,
            experimentItems: results.experimentItems,
            skeletonCount: pages.skeletonCount,
            gridRef: pages.gridRef
        },
        more: {
            hasMore: pages.hasMore,
            isFetchingMore: pages.isFetchingMore,
            loadMoreError: pages.loadMoreError,
            loadMore: pages.loadMore,
            retryLoadMore: pages.retryLoadMore
        }
    }
}

export default useProjects
