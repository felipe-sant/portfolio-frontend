import stripLanguagePrefix from "@/i18n/stripLanguagePrefix"
import type ProjectDetail from "@/types/project/ProjectDetail.types"
import type RootState from "@/types/store/RootState.types"
import findDocumentByName from "@/utils/findDocumentByName"
import isUuidV7 from "@/utils/isUuidV7"
import removeBasePath from "@/utils/removeBasePath"

const PROJECT_PATH = /^\/projects\/([^/]+)(?:\/docs\/([^/]+))?$/

function isProjectDetail(data: unknown): data is ProjectDetail {
    return (
        typeof data === "object" &&
        data !== null &&
        "id" in data &&
        "documents" in data &&
        Array.isArray(data.documents)
    )
}

function shouldPreloadMarkdown(pathname: string, state?: Partial<RootState>): boolean {
    const match = PROJECT_PATH.exec(stripLanguagePrefix(removeBasePath(pathname)))
    const id = match?.[1]

    if (!isUuidV7(id)) {
        return false
    }

    const project = Object.values(state?.api?.queries ?? {})
        .map((entry) => entry?.data)
        .find((data) => isProjectDetail(data) && data.id === id)

    if (!isProjectDetail(project)) {
        return false
    }

    const name = match?.[2] === undefined ? undefined : decodeURIComponent(match[2])

    return findDocumentByName(project.documents, name)?.format === "markdown"
}

export default shouldPreloadMarkdown
