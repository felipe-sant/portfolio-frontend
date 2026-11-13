import Button from "@/components/Button"
import AsyncSection from "@/components/AsyncSection"
import FilterGroup from "@/components/FilterGroup"
import JsonLd from "@/components/JsonLd"
import LoadError from "@/components/LoadError"
import PageMeta from "@/components/PageMeta"
import ProjectsEmptyState from "@/components/ProjectsEmptyState"
import ProjectsFiltersModal from "@/components/ProjectsFiltersModal"
import ProjectsGrid from "@/components/ProjectsGrid"
import SearchInput from "@/components/SearchInput"
import useProjects from "@/pages/hooks/useProjects"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/projects.module.css"
import projectsPageSize from "@/utils/projectsPageSize"

const SEARCH_MAX_LENGTH = 100

function ProjectsPage() {
    const { t, shareImage, ids, seo, filters, search, filterBar, modal, results, list, more } =
        useProjects()
    const { ref: filterBarRef, dragProps, ...bar } = filterBar
    const { gridRef, ...listState } = list

    return (
        <>
            <title>{t("meta.title")}</title>
            <meta name="description" content={t("meta.description")} />
            <PageMeta
                title={t("meta.title")}
                description={t("meta.description")}
                path={ROUTES.projects}
                image={shareImage.image}
                imageAlt={shareImage.imageAlt}
            />
            {seo.jsonLd && <JsonLd data={seo.jsonLd} />}
            {seo.breadcrumbJsonLd && <JsonLd data={seo.breadcrumbJsonLd} />}
            <div className={css.container}>
                <h1 id={ids.heading} tabIndex={-1} className={css.heading}>
                    {t("heading")}
                </h1>
                <p className={css.intro}>{t("intro")}</p>
                {results.isEmptyContent ? (
                    <ProjectsEmptyState
                        heading={t("empty.heading")}
                        description={t("empty.description")}
                    />
                ) : (
                    <>
                        <div className={css.controls}>
                            <div className={css.search}>
                                <SearchInput
                                    id={ids.search}
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
                                aria-expanded={modal.isOpen}
                                onClick={modal.open}
                            >
                                {modal.filtersCount > 0
                                    ? t("filters.openWithCount", { count: modal.filtersCount })
                                    : t("filters.open")}
                            </Button>
                        </div>
                        <div ref={filterBarRef} className={css.filters} {...dragProps}>
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
                                value={filters.category}
                                onChange={bar.setCategory}
                            />
                        </div>
                        <div className={css.summary}>
                            <p role={"status"} className={css.count}>
                                {results.text}
                            </p>
                            {results.canClearFilters && (
                                <Button variant="ghost" onClick={results.clearFilters}>
                                    {t("results.clearFilters")}
                                </Button>
                            )}
                        </div>
                        <AsyncSection
                            isLoading={listState.isLoading}
                            isError={listState.isError}
                            skeleton={
                                <ProjectsGrid projects={[]} skeletonCount={projectsPageSize} />
                            }
                            error={{
                                title: t("error.heading"),
                                description: t("error.description"),
                                retryLabel: t("error.retry"),
                                onRetry: listState.retry
                            }}
                        >
                            {results.isNoResults && !listState.isError && (
                                <ProjectsEmptyState
                                    heading={t("noResults.heading")}
                                    description={
                                        filters.q === ""
                                            ? t("noResults.withoutSearch")
                                            : t("noResults.withSearch", { query: filters.q })
                                    }
                                    action={
                                        <Button variant="secondary" onClick={results.clearFilters}>
                                            {t("results.clearFilters")}
                                        </Button>
                                    }
                                />
                            )}
                            {!listState.isError && !results.isNoResults && (
                                <div ref={gridRef}>
                                    {(listState.mainItems.length > 0 ||
                                        listState.experimentItems.length === 0) && (
                                        <ProjectsGrid
                                            projects={listState.mainItems}
                                            skeletonCount={
                                                listState.experimentItems.length === 0
                                                    ? listState.skeletonCount
                                                    : 0
                                            }
                                        />
                                    )}
                                    {listState.experimentItems.length > 0 && (
                                        <section className={css.experiments}>
                                            <h2 className={css.experimentsHeading}>
                                                {t("experiments.heading")}
                                            </h2>
                                            <p className={css.experimentsDescription}>
                                                {t("experiments.description")}
                                            </p>
                                            <ProjectsGrid
                                                projects={listState.experimentItems}
                                                firstIndex={listState.mainItems.length}
                                                headingLevel={3}
                                                skeletonCount={listState.skeletonCount}
                                            />
                                        </section>
                                    )}
                                </div>
                            )}
                        </AsyncSection>
                        {more.loadMoreError && (
                            <div className={css.moreError}>
                                <LoadError
                                    id={ids.loadMoreAlert}
                                    title={t("loadMoreError.heading")}
                                    retryLabel={t("loadMoreError.retry")}
                                    onRetry={more.retryLoadMore}
                                />
                            </div>
                        )}
                        {more.hasMore && !listState.isError && (
                            <div className={css.more}>
                                <Button
                                    variant="secondary"
                                    loading={more.isFetchingMore}
                                    onClick={more.loadMore}
                                >
                                    {t("loadMore")}
                                </Button>
                            </div>
                        )}
                        <ProjectsFiltersModal
                            isOpen={modal.isOpen}
                            technologies={modal.technologyOptions}
                            years={modal.yearOptions}
                            applied={modal.applied}
                            sorts={modal.sortOptions}
                            onApply={modal.applyModalFilters}
                            onClose={modal.close}
                        />
                    </>
                )}
            </div>
        </>
    )
}

export default ProjectsPage
