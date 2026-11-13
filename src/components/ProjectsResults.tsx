import type { RefObject } from "react"
import { useTranslation } from "react-i18next"
import AsyncSection from "@/components/AsyncSection"
import Button from "@/components/Button"
import ProjectsEmptyState from "@/components/ProjectsEmptyState"
import ProjectsExperiments from "@/components/ProjectsExperiments"
import ProjectsGrid from "@/components/ProjectsGrid"
import type ProjectSummary from "@/types/project/ProjectSummary.types"
import projectsPageSize from "@/utils/projectsPageSize"

interface ProjectsResultsList {
    isLoading: boolean
    isError: boolean
    retry: () => void
    mainItems: ProjectSummary[]
    experimentItems: ProjectSummary[]
    skeletonCount: number
    gridRef: RefObject<HTMLDivElement | null>
}

interface ProjectsResultsProps {
    list: ProjectsResultsList
    isNoResults: boolean
    query: string
    onClearFilters: () => void
}

function ProjectsResults({ list, isNoResults, query, onClearFilters }: ProjectsResultsProps) {
    const { t } = useTranslation("projects")
    const { gridRef, ...listState } = list

    return (
        <AsyncSection
            isLoading={listState.isLoading}
            isError={listState.isError}
            skeleton={<ProjectsGrid projects={[]} skeletonCount={projectsPageSize} />}
            error={{
                title: t("error.heading"),
                description: t("error.description"),
                retryLabel: t("error.retry"),
                onRetry: listState.retry
            }}
        >
            {isNoResults && !listState.isError && (
                <ProjectsEmptyState
                    heading={t("noResults.heading")}
                    description={
                        query === ""
                            ? t("noResults.withoutSearch")
                            : t("noResults.withSearch", { query })
                    }
                    action={
                        <Button variant="secondary" onClick={onClearFilters}>
                            {t("results.clearFilters")}
                        </Button>
                    }
                />
            )}
            {!listState.isError && !isNoResults && (
                <div ref={gridRef}>
                    {(listState.mainItems.length > 0 || listState.experimentItems.length === 0) && (
                        <ProjectsGrid
                            projects={listState.mainItems}
                            skeletonCount={
                                listState.experimentItems.length === 0 ? listState.skeletonCount : 0
                            }
                        />
                    )}
                    {listState.experimentItems.length > 0 && (
                        <ProjectsExperiments
                            projects={listState.experimentItems}
                            firstIndex={listState.mainItems.length}
                            skeletonCount={listState.skeletonCount}
                        />
                    )}
                </div>
            )}
        </AsyncSection>
    )
}

export default ProjectsResults
