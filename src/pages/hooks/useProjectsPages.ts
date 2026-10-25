import { useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import projectsApi from "@/store/api/projects.api"
import type ProjectsQueryArgs from "@/types/project/ProjectsQueryArgs.types"
import getProjectsSkeletonCount from "@/utils/getProjectsSkeletonCount"
import projectsElementIds from "@/utils/projectsElementIds"

function readPages(state: unknown): number | undefined {
    if (
        typeof state === "object" &&
        state !== null &&
        "pages" in state &&
        typeof state.pages === "number" &&
        Number.isInteger(state.pages) &&
        state.pages >= 1
    ) {
        return state.pages
    }

    return undefined
}

function useProjectsPages(args: ProjectsQueryArgs) {
    const location = useLocation()
    const navigate = useNavigate()
    const gridRef = useRef<HTMLUListElement>(null)
    const focusIndex = useRef<number | null>(null)
    const query = projectsApi.useGetProjectsPagesInfiniteQuery(args)
    const { hasNextPage, isFetching, isFetchNextPageError, fetchNextPage } = query
    const requestedPages = readPages(location.state) ?? 1
    const loadedPages = query.data?.pages ?? []
    const pages = loadedPages.slice(0, requestedPages)
    const items = pages.flatMap((page) => page.items)
    const firstPage = loadedPages[0]
    const shown = items.length
    const total = firstPage?.total ?? 0
    const loadMoreError = isFetchNextPageError && !query.isFetchingNextPage
    const isFetchingMore =
        query.isFetchingNextPage ||
        (!loadMoreError && hasNextPage && pages.length > 0 && pages.length < requestedPages)

    useEffect(() => {
        if (
            loadedPages.length > 0 &&
            loadedPages.length < requestedPages &&
            hasNextPage &&
            !isFetching &&
            !isFetchNextPageError
        ) {
            void fetchNextPage()
        }
    }, [
        loadedPages.length,
        requestedPages,
        hasNextPage,
        isFetching,
        isFetchNextPageError,
        fetchNextPage
    ])

    useEffect(() => {
        const index = focusIndex.current

        if (index !== null && shown > index) {
            focusIndex.current = null
            gridRef.current?.children[index]?.querySelector("a")?.focus()
        }
    }, [shown])

    useEffect(() => {
        if (loadMoreError) {
            document.getElementById(projectsElementIds.loadMoreAlert)?.focus()
        }
    }, [loadMoreError])

    function loadMore() {
        if (isFetching || isFetchingMore || loadMoreError || shown >= total) {
            return
        }

        focusIndex.current = shown
        void navigate(
            { pathname: location.pathname, search: location.search, hash: location.hash },
            { replace: true, state: { pages: requestedPages + 1 }, preventScrollReset: true }
        )
    }

    function retryLoadMore() {
        void fetchNextPage()
    }

    return {
        hasData: query.data !== undefined,
        items,
        shown,
        total,
        availableTypes: firstPage?.availableTypes ?? [],
        availableTechnologies: firstPage?.availableTechnologies ?? [],
        availableYears: firstPage?.availableYears ?? [],
        isLoading: query.isLoading,
        isError: query.isError && !isFetchNextPageError && !isFetching,
        hasMore: shown < total && !loadMoreError,
        isFetchingMore,
        skeletonCount: isFetchingMore ? getProjectsSkeletonCount(total, shown) : 0,
        loadMoreError,
        loadMore,
        retryLoadMore,
        retry: () => query.refetch(),
        gridRef
    }
}

export default useProjectsPages
