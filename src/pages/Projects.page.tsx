import Button from "@/components/Button"
import FilterGroup from "@/components/FilterGroup"
import JsonLd from "@/components/JsonLd"
import LoadError from "@/components/LoadError"
import PageMeta from "@/components/PageMeta"
import ProjectCard from "@/components/ProjectCard"
import ProjectCardSkeleton from "@/components/ProjectCardSkeleton"
import SearchInput from "@/components/SearchInput"
import SelectField from "@/components/SelectField"
import SkeletonSwap from "@/components/SkeletonSwap"
import useProjects from "@/pages/hooks/useProjects"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/projects.module.css"
import projectsPageSize from "@/utils/projectsPageSize"

interface SkeletonItemsProps {
    count: number
}

const SEARCH_MAX_LENGTH = 100

function SkeletonItems({ count }: SkeletonItemsProps) {
    return Array.from({ length: count }, (_value, index) => (
        <li key={index} className={css.item} aria-hidden="true">
            <ProjectCardSkeleton />
        </li>
    ))
}

function ProjectsPage() {
    const {
        t,
        ids,
        jsonLd,
        filters,
        draft,
        setDraft,
        clearSearch,
        clearFilters,
        setType,
        setCategory,
        setSort,
        hasFilters,
        typeValue,
        typeOptions,
        categoryOptions,
        sortOptions,
        resultsText,
        isEmptyContent,
        isNoResults,
        isLoading,
        isError,
        retry,
        items,
        hasMore,
        isFetchingMore,
        skeletonCount,
        loadMoreError,
        loadMore,
        retryLoadMore,
        gridRef
    } = useProjects()
    const canClearFilters = hasFilters && !isLoading && !isError && !isNoResults

    return (
        <>
            <title>{t("meta.title")}</title>
            <meta name="description" content={t("meta.description")} />
            <PageMeta
                title={t("meta.title")}
                description={t("meta.description")}
                path={ROUTES.projects}
            />
            {jsonLd && <JsonLd data={jsonLd} />}
            <div className={css.container}>
                <h1 id={ids.heading} tabIndex={-1} className={css.heading}>
                    {t("heading")}
                </h1>
                <p className={css.intro}>{t("intro")}</p>
                {isEmptyContent ? (
                    <div className={css.emptyBox}>
                        <h2 className={css.emptyHeading}>{t("empty.heading")}</h2>
                        <p className={css.emptyText}>{t("empty.description")}</p>
                    </div>
                ) : (
                    <>
                        <div className={css.controls}>
                            <div className={css.search}>
                                <SearchInput
                                    id={ids.search}
                                    value={draft}
                                    onChange={setDraft}
                                    onClear={clearSearch}
                                    label={t("search.label")}
                                    placeholder={t("search.placeholder")}
                                    maxLength={SEARCH_MAX_LENGTH}
                                />
                            </div>
                            <SelectField
                                label={t("sort.label")}
                                options={sortOptions}
                                value={filters.sort}
                                onChange={setSort}
                            />
                        </div>
                        <div className={css.filters}>
                            <FilterGroup
                                label={t("filters.type.label")}
                                options={typeOptions}
                                value={typeValue}
                                onChange={setType}
                            />
                            <span className={css.separator} aria-hidden="true" />
                            <FilterGroup
                                label={t("filters.category.label")}
                                options={categoryOptions}
                                value={filters.category}
                                onChange={setCategory}
                            />
                        </div>
                        <div className={css.summary}>
                            <p role={"status"} className={css.count}>
                                {resultsText}
                            </p>
                            {canClearFilters && (
                                <Button variant="ghost" onClick={clearFilters}>
                                    {t("results.clearFilters")}
                                </Button>
                            )}
                        </div>
                        <SkeletonSwap
                            isLoading={isLoading}
                            skeleton={
                                <ul className={css.grid}>
                                    <SkeletonItems count={projectsPageSize} />
                                </ul>
                            }
                        >
                            {isError && (
                                <LoadError
                                    title={t("error.heading")}
                                    description={t("error.description")}
                                    retryLabel={t("error.retry")}
                                    onRetry={retry}
                                />
                            )}
                            {isNoResults && !isError && (
                                <div className={css.emptyBox}>
                                    <h2 className={css.emptyHeading}>{t("noResults.heading")}</h2>
                                    <p className={css.emptyText}>
                                        {filters.q === ""
                                            ? t("noResults.withoutSearch")
                                            : t("noResults.withSearch", { query: filters.q })}
                                    </p>
                                    <Button variant="secondary" onClick={clearFilters}>
                                        {t("results.clearFilters")}
                                    </Button>
                                </div>
                            )}
                            {!isError && !isNoResults && (
                                <ul ref={gridRef} className={css.grid}>
                                    {items.map((project, index) => (
                                        <li key={project.id} className={css.item}>
                                            <ProjectCard
                                                project={project}
                                                index={index}
                                                revealIndex={index % projectsPageSize}
                                            />
                                        </li>
                                    ))}
                                    <SkeletonItems count={skeletonCount} />
                                </ul>
                            )}
                        </SkeletonSwap>
                        {loadMoreError && (
                            <div className={css.moreError}>
                                <LoadError
                                    id={ids.loadMoreAlert}
                                    title={t("loadMoreError.heading")}
                                    retryLabel={t("loadMoreError.retry")}
                                    onRetry={retryLoadMore}
                                />
                            </div>
                        )}
                        {hasMore && !isError && (
                            <div className={css.more}>
                                <Button
                                    variant="secondary"
                                    loading={isFetchingMore}
                                    onClick={loadMore}
                                >
                                    {t("loadMore")}
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    )
}

export default ProjectsPage
