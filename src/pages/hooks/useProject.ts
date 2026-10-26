import { useTranslation } from "react-i18next"
import { useParams } from "react-router-dom"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import projectsApi from "@/store/api/projects.api"
import isUuidV7 from "@/utils/isUuidV7"

function useProject() {
    const { t, i18n } = useTranslation("project")
    const { id } = useParams()
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    const isValidId = isUuidV7(id)
    const query = projectsApi.useGetProjectQuery(
        { id: isValidId ? id : "", lang: language },
        { skip: !isValidId }
    )
    const project = query.currentData
    const fallbackTitle = t("meta.fallbackTitle")

    function resolveStatus() {
        if (!isValidId) {
            return "notFound"
        }

        if (project) {
            return "success"
        }

        if (query.isError && !query.isFetching) {
            return "status" in query.error && query.error.status === 404 ? "notFound" : "error"
        }

        return "loading"
    }

    function retry() {
        return query.refetch()
    }

    return {
        status: resolveStatus(),
        project,
        id,
        language,
        fallbackTitle,
        title: project ? t("meta.title", { project: project.title }) : fallbackTitle,
        retry
    }
}

export default useProject
