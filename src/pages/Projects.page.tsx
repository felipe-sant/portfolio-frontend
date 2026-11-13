import JsonLd from "@/components/JsonLd"
import PageMeta from "@/components/PageMeta"
import ProjectsEmptyState from "@/components/ProjectsEmptyState"
import ProjectsFilterBar from "@/components/ProjectsFilterBar"
import ProjectsFiltersModal from "@/components/ProjectsFiltersModal"
import ProjectsLoadMore from "@/components/ProjectsLoadMore"
import ProjectsResults from "@/components/ProjectsResults"
import ProjectsSummary from "@/components/ProjectsSummary"
import ProjectsToolbar from "@/components/ProjectsToolbar"
import useProjects from "@/pages/hooks/useProjects"
import ROUTES from "@/routers/paths"
import css from "@/styles/pages/projects.module.css"

function ProjectsPage() {
    const { t, shareImage, ids, seo, filters, search, filterBar, modal, results, list, more } =
        useProjects()

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
                        <ProjectsFilterBar filterBar={filterBar} categoryValue={filters.category} />
                        <ProjectsSummary
                            text={results.text}
                            canClear={results.canClearFilters}
                            onClear={results.clearFilters}
                        />
                        <ProjectsResults
                            list={list}
                            isNoResults={results.isNoResults}
                            query={filters.q}
                            onClearFilters={results.clearFilters}
                        />
                        <ProjectsLoadMore
                            more={more}
                            alertId={ids.loadMoreAlert}
                            isListError={list.isError}
                        />
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
