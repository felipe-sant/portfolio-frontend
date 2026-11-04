import isUuidV7 from "@/utils/isUuidV7"

const PROJECT_PATH = /^\/projects\/([^/]+)(?:\/docs\/[^/]+)?$/

function getProjectContext(contentPath: string): { id: string } | undefined {
    const id = PROJECT_PATH.exec(contentPath)?.[1]

    return isUuidV7(id) ? { id } : undefined
}

export default getProjectContext
