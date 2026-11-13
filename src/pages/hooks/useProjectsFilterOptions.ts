import { useTranslation } from "react-i18next"
import PROJECT_CATEGORIES from "@/enum/projectCategories.enum"
import PROJECT_SORTS from "@/enum/projectSorts.enum"
import PROJECT_TYPES from "@/enum/projectTypes.enum"
import useLanguage from "@/hooks/useLanguage"
import projectsApi from "@/store/api/projects.api"
import type ProjectType from "@/types/project/ProjectType.types"
import type ProjectsFilters from "@/types/project/ProjectsFilters.types"

function useProjectsFilterOptions(filters: ProjectsFilters, availableTypes: ProjectType[]) {
    const { t } = useTranslation(["projects", "common"])
    const language = useLanguage()
    const filterOptionsQuery = projectsApi.useGetProjectFilterOptionsQuery({ lang: language })
    const appliedFilters = {
        tech: filters.tech ?? [],
        year: filters.year ?? [],
        sort: filters.sort
    }

    return {
        typeValue: filters.type ?? "",
        typeOptions: [
            { value: "", label: t("filters.type.all") },
            ...PROJECT_TYPES.filter((type) => availableTypes.includes(type)).map((type) => ({
                value: type,
                label: t(`common:projectType.${type}`)
            }))
        ],
        categoryOptions: PROJECT_CATEGORIES.map((category) => ({
            value: category,
            label: t(`filters.category.${category}`)
        })),
        sortOptions: PROJECT_SORTS.map((sort) => ({ value: sort, label: t(`sort.${sort}`) })),
        technologyOptions: filterOptionsQuery.currentData?.technologies ?? [],
        yearOptions: filterOptionsQuery.currentData?.years ?? [],
        appliedFilters,
        filtersCount: appliedFilters.tech.length + appliedFilters.year.length
    }
}

export default useProjectsFilterOptions
