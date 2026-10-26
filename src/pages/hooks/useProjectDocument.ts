import { useTranslation } from "react-i18next"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import resolveSupportedLanguage from "@/i18n/resolveSupportedLanguage"
import projectsApi from "@/store/api/projects.api"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import findDocumentByName from "@/utils/findDocumentByName"

function useProjectDocument(project: ProjectDetail, name?: string) {
    const { i18n } = useTranslation()
    const language = resolveSupportedLanguage(i18n.resolvedLanguage) ?? FALLBACK_LANGUAGE
    const document = findDocumentByName(project.documents, name)
    const query = projectsApi.useGetProjectDocumentContentQuery(
        { id: project.id, documentId: document?.id ?? "", lang: language },
        { skip: !document }
    )

    function retry() {
        return query.refetch()
    }

    function resolveStatus() {
        if (!document) {
            return "notFound"
        }

        if (query.currentData !== undefined) {
            return "success"
        }

        return query.isError && !query.isFetching ? "error" : "loading"
    }

    return {
        status: resolveStatus(),
        document,
        exactName: document?.name,
        content: query.currentData,
        format: document?.format === "markdown" ? "markdown" : "text",
        lang: document && !document.translated ? document.contentLanguage : undefined,
        retry
    }
}

export default useProjectDocument
