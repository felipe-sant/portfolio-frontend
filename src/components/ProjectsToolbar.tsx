import { useTranslation } from "react-i18next"
import Button from "@/components/Button"
import SearchInput from "@/components/SearchInput"
import css from "@/styles/components/projectsToolbar.module.css"

interface ProjectsToolbarSearch {
    draft: string
    setDraft: (value: string) => void
    clearSearch: () => void
}

interface ProjectsToolbarProps {
    searchId: string
    search: ProjectsToolbarSearch
    filtersCount: number
    isFiltersOpen: boolean
    onOpenFilters: () => void
}

const SEARCH_MAX_LENGTH = 100

function ProjectsToolbar({
    searchId,
    search,
    filtersCount,
    isFiltersOpen,
    onOpenFilters
}: ProjectsToolbarProps) {
    const { t } = useTranslation("projects")

    return (
        <div className={css.controls}>
            <div className={css.search}>
                <SearchInput
                    id={searchId}
                    value={search.draft}
                    onChange={search.setDraft}
                    onClear={search.clearSearch}
                    label={t("search.label")}
                    placeholder={t("search.placeholder")}
                    maxLength={SEARCH_MAX_LENGTH}
                />
            </div>
            <Button
                variant="secondary"
                icon="filter"
                aria-haspopup="dialog"
                aria-expanded={isFiltersOpen}
                onClick={onOpenFilters}
            >
                {filtersCount > 0
                    ? t("filters.openWithCount", { count: filtersCount })
                    : t("filters.open")}
            </Button>
        </div>
    )
}

export default ProjectsToolbar
