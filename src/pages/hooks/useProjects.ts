import { useDeferredValue, useState } from "react"
import { useTranslation } from "react-i18next"
import PROJECT_CATEGORIES from "@/enum/projectCategories.enum"
import PROJECT_SORTS from "@/enum/projectSorts.enum"
import PROJECT_TYPES from "@/enum/projectTypes.enum"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import useProjectsFilters from "@/pages/hooks/useProjectsFilters"
import useProjectsPages from "@/pages/hooks/useProjectsPages"
import projectsApi from "@/store/api/projects.api"
import buildProjectsJsonLd from "@/utils/buildProjectsJsonLd"
import buildProjectsQueryArgs from "@/utils/buildProjectsQueryArgs"
import projectsElementIds from "@/utils/projectsElementIds"

function useProjects() {
    const { t, i18n } = useTranslation(["projects", "common"])
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
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
    const pages = useProjectsPages(buildProjectsQueryArgs(language, filters))
    const indexQuery = projectsApi.useGetProjectsIndexQuery({ lang: language })
    const filterOptionsQuery = projectsApi.useGetProjectFilterOptionsQuery({ lang: language })

    const [isFiltersOpen, setIsFiltersOpen] = useState(false)
    const appliedFilters = {
        tech: filters.tech ?? [],
        year: filters.year ?? [],
        sort: filters.sort
    }

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

    const currentResultsText = buildResultsText()
    const resultsText = useDeferredValue(
        currentResultsText,
        pages.hasData ? currentResultsText : ""
    )

    return {
        t,
        language,
        ids: projectsElementIds,
        jsonLd: indexQuery.data
            ? buildProjectsJsonLd(
                  language,
                  { title: t("meta.title"), description: t("meta.description") },
                  indexQuery.data.items
              )
            : undefined,
        filters,
        draft,
        setDraft,
        clearSearch,
        clearFilters,
        setType,
        setCategory,
        applyModalFilters,
        hasFilters,
        filtersCount: appliedFilters.tech.length + appliedFilters.year.length,
        appliedFilters,
        isFiltersOpen,
        openFilters,
        closeFilters: () => setIsFiltersOpen(false),
        typeValue: filters.type ?? "",
        typeOptions: [
            { value: "", label: t("filters.type.all") },
            ...PROJECT_TYPES.filter((type) => pages.availableTypes.includes(type)).map((type) => ({
                value: type,
                label: t(`common:projectType.${type}`)
            }))
        ],
        categoryOptions: PROJECT_CATEGORIES.map((category) => ({
            value: category,
            label: t(`filters.category.${category}`)
        })),
        technologyOptions: filterOptionsQuery.currentData?.technologies ?? [],
        yearOptions: filterOptionsQuery.currentData?.years ?? [],
        sortOptions: PROJECT_SORTS.map((sort) => ({ value: sort, label: t(`sort.${sort}`) })),
        resultsText,
        isEmptyContent,
        isNoResults,
        ...pages,
        retry
    }
}

export default useProjects
