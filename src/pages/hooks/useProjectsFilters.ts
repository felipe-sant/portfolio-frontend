import { useEffect, useEffectEvent, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import PROJECT_CATEGORIES from "@/enum/projectCategories.enum"
import PROJECT_TYPES from "@/enum/projectTypes.enum"
import useDebounce from "@/hooks/useDebounce"
import useHasHydrated from "@/hooks/useHasHydrated"
import type ProjectsAppliedFilters from "@/types/project/ProjectsAppliedFilters.types"
import type ProjectsFilters from "@/types/project/ProjectsFilters.types"
import buildProjectsSearch from "@/utils/buildProjectsSearch"
import defaultProjectSort from "@/utils/defaultProjectSort"
import hasProjectsFilters from "@/utils/hasProjectsFilters"
import parseProjectsSearchParams from "@/utils/parseProjectsSearchParams"
import projectsElementIds from "@/utils/projectsElementIds"

const DEFAULT_FILTERS: ProjectsFilters = { q: "", sort: defaultProjectSort }
const SEARCH_DELAY = 300

function useProjectsFilters() {
    const location = useLocation()
    const navigate = useNavigate()
    const hasHydrated = useHasHydrated()
    const urlFilters = useMemo(
        () => parseProjectsSearchParams(new URLSearchParams(location.search)),
        [location.search]
    )
    const filters = hasHydrated ? urlFilters : DEFAULT_FILTERS
    const [draft, setDraft] = useState(filters.q)
    const debouncedDraft = useDebounce(draft, SEARCH_DELAY)
    const writtenQuery = useRef(filters.q)

    function apply(next: ProjectsFilters) {
        void navigate(
            { pathname: location.pathname, search: buildProjectsSearch(next), hash: location.hash },
            { replace: true, preventScrollReset: true }
        )
    }

    const applyDraft = useEffectEvent((value: string) => {
        const query = value.trim()

        if (query !== filters.q) {
            writtenQuery.current = query
            apply({ ...filters, q: query })
        }
    })

    useEffect(() => {
        applyDraft(debouncedDraft)
    }, [debouncedDraft])

    useEffect(() => {
        if (filters.q !== writtenQuery.current) {
            setDraft(filters.q)
        }

        writtenQuery.current = filters.q
    }, [filters.q])

    function clearSearch() {
        setDraft("")
        writtenQuery.current = ""
        apply({ ...filters, q: "" })
    }

    function clearFilters() {
        setDraft("")
        writtenQuery.current = ""
        apply({ q: "", sort: filters.sort })
        document.getElementById(projectsElementIds.search)?.focus()
    }

    function setType(value: string) {
        const type = PROJECT_TYPES.find((option) => option === value)

        if (type !== filters.type) {
            apply({ ...filters, type })
        }
    }

    function setCategory(value: string) {
        const category = PROJECT_CATEGORIES.find((option) => option === value)

        apply({ ...filters, category: category === filters.category ? undefined : category })
    }

    function applyModalFilters({ tech, year, sort }: ProjectsAppliedFilters) {
        apply({ ...filters, tech, year, sort })
    }

    return {
        filters,
        draft,
        setDraft,
        clearSearch,
        clearFilters,
        setType,
        setCategory,
        applyModalFilters,
        hasFilters: hasProjectsFilters(filters)
    }
}

export default useProjectsFilters
