import Button from "@/components/Button"
import FilterGroup from "@/components/FilterGroup"
import JsonLd from "@/components/JsonLd"
import LoadError from "@/components/LoadError"
import PageMeta from "@/components/PageMeta"
import ProjectsEmptyState from "@/components/ProjectsEmptyState"
import ProjectsFiltersModal from "@/components/ProjectsFiltersModal"
import ProjectsResults from "@/components/ProjectsResults"
import ProjectsToolbar from "@/components/ProjectsToolbar"
import useProjects from "@/pages/hooks/useProjects"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/projects.module.css"

function ProjectsPage() {
    const { t, shareImage, ids, seo, filters, search, filterBar, modal, results, list, more } =
        useProjects()
    const { ref: filterBarRef, dragProps, ...bar } = filterBar

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
                        <ProjectsToolbar
                            searchId={ids.search}
                            search={search}
                            filtersCount={modal.filtersCount}
                            isFiltersOpen={modal.isOpen}
                            onOpenFilters={modal.open}
                        />
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
                        <ProjectsResults
                            list={list}
                            isNoResults={results.isNoResults}
                            query={filters.q}
                            onClearFilters={results.clearFilters}
                        />
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
                        {more.hasMore && !list.isError && (
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
