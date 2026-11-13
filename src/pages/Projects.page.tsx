import Button from "@/components/Button"
import AsyncSection from "@/components/AsyncSection"
import FilterGroup from "@/components/FilterGroup"
import JsonLd from "@/components/JsonLd"
import LoadError from "@/components/LoadError"
import PageMeta from "@/components/PageMeta"
import ProjectCard from "@/components/ProjectCard"
import ProjectCardSkeleton from "@/components/ProjectCardSkeleton"
import ProjectsFiltersModal from "@/components/ProjectsFiltersModal"
import SearchInput from "@/components/SearchInput"
import useProjects from "@/pages/hooks/useProjects"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/projects.module.css"
import type ProjectSummary from "@/types/project/ProjectSummary.types"
import projectsPageSize from "@/utils/projectsPageSize"

interface SkeletonItemsProps {
    count: number
}

interface ProjectListItemProps {
    project: ProjectSummary
    index: number
    headingLevel?: 2 | 3
}

const SEARCH_MAX_LENGTH = 100

function SkeletonItems({ count }: SkeletonItemsProps) {
    return Array.from({ length: count }, (_value, index) => (
        <li key={index} className={css.item} aria-hidden="true">
            <ProjectCardSkeleton />
        </li>
    ))
}

function ProjectListItem({ project, index, headingLevel }: ProjectListItemProps) {
    return (
        <li className={css.item}>
            <ProjectCard
                project={project}
                index={index}
                revealIndex={index % projectsPageSize}
                headingLevel={headingLevel}
                fromProjects
            />
        </li>
    )
}

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
                                <ul className={css.grid}>
                                    <SkeletonItems count={projectsPageSize} />
                                </ul>
                            }
                            error={{
                                title: t("error.heading"),
                                description: t("error.description"),
                                retryLabel: t("error.retry"),
                                onRetry: listState.retry
                            }}
                        >
                            {results.isNoResults && !listState.isError && (
                                <div className={css.emptyBox}>
                                    <h2 className={css.emptyHeading}>{t("noResults.heading")}</h2>
                                    <p className={css.emptyText}>
                                        {filters.q === ""
                                            ? t("noResults.withoutSearch")
                                            : t("noResults.withSearch", { query: filters.q })}
                                    </p>
                                    <Button variant="secondary" onClick={results.clearFilters}>
                                        {t("results.clearFilters")}
                                    </Button>
                                </div>
                            )}
                            {!listState.isError && !results.isNoResults && (
                                <div ref={gridRef}>
                                    {(listState.mainItems.length > 0 ||
                                        listState.experimentItems.length === 0) && (
                                        <ul className={css.grid}>
                                            {listState.mainItems.map((project, index) => (
                                                <ProjectListItem
                                                    key={project.id}
                                                    project={project}
                                                    index={index}
                                                />
                                            ))}
                                            {listState.experimentItems.length === 0 && (
                                                <SkeletonItems count={listState.skeletonCount} />
                                            )}
                                        </ul>
                                    )}
                                    {listState.experimentItems.length > 0 && (
                                        <section className={css.experiments}>
                                            <h2 className={css.experimentsHeading}>
                                                {t("experiments.heading")}
                                            </h2>
                                            <p className={css.experimentsDescription}>
                                                {t("experiments.description")}
                                            </p>
                                            <ul className={css.grid}>
                                                {listState.experimentItems.map((project, index) => (
                                                    <ProjectListItem
                                                        key={project.id}
                                                        project={project}
                                                        index={listState.mainItems.length + index}
                                                        headingLevel={3}
                                                    />
                                                ))}
                                                <SkeletonItems count={listState.skeletonCount} />
                                            </ul>
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
