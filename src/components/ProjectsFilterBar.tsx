import type { HTMLAttributes, RefObject } from "react"
import { useTranslation } from "react-i18next"
import FilterGroup from "@/components/FilterGroup"
import css from "@/styles/components/projectsFilterBar.module.css"

interface ProjectsFilterBarOption {
    value: string
    label: string
}

interface ProjectsFilterBarState {
    ref: RefObject<HTMLDivElement | null>
    dragProps: HTMLAttributes<HTMLDivElement>
    typeValue: string
    typeOptions: ProjectsFilterBarOption[]
    categoryOptions: ProjectsFilterBarOption[]
    setType: (value: string) => void
    setCategory: (value: string) => void
}

interface ProjectsFilterBarProps {
    filterBar: ProjectsFilterBarState
    categoryValue: string | undefined
}

function ProjectsFilterBar({ filterBar, categoryValue }: ProjectsFilterBarProps) {
    const { t } = useTranslation("projects")
    const { ref, dragProps, ...bar } = filterBar

    return (
        <div ref={ref} className={css.filters} {...dragProps}>
            <FilterGroup
                label={t("filters.type.label")}
                options={bar.typeOptions}
                value={bar.typeValue}
                onChange={bar.setType}
            />
            <span className={css.separator} aria-hidden="true" />
            <FilterGroup
                label={t("filters.category.label")}
                options={bar.categoryOptions}
                value={categoryValue}
                onChange={bar.setCategory}
            />
        </div>
    )
}

export default ProjectsFilterBar
