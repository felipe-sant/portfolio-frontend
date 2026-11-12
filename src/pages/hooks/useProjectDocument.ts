import { useTranslation } from "react-i18next"
import useLanguage from "@/hooks/useLanguage"
import projectsApi from "@/store/api/projects.api"
import type DocumentFormat from "@/types/project/DocumentFormat.types"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import buildDocumentDescription from "@/utils/buildDocumentDescription"
import findDocumentByName from "@/utils/findDocumentByName"

function useProjectDocument(project: ProjectDetail, name?: string) {
    const { t } = useTranslation("project")
    const language = useLanguage()
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

    const format: DocumentFormat = document?.format === "markdown" ? "markdown" : "text"

    const isDocumentPage = document !== undefined && document.name !== "README.md"
    const description = isDocumentPage
        ? (buildDocumentDescription(query.currentData, format) ??
          t("meta.documentDescription", { document: document.name, project: project.title }))
        : project.summary

    return {
        description,
        status: resolveStatus(),
        document,
        exactName: document?.name,
        content: query.currentData,
        format,
        lang: document && !document.translated ? document.contentLanguage : undefined,
        retry
    }
}

export default useProjectDocument
