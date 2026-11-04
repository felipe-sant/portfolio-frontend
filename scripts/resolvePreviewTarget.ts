const DEFAULT_DIRECTORY = "dist"
const DEFAULT_PORT = 4173

type PreviewTarget = {
    directory: string
    port: number
}

function resolvePreviewTarget(env: Record<string, string | undefined>): PreviewTarget {
    const port = Number(env.PREVIEW_PORT)

    return {
        directory: env.PREVIEW_DIR || DEFAULT_DIRECTORY,
        port: Number.isInteger(port) && port > 0 ? port : DEFAULT_PORT
    }
}

export default resolvePreviewTarget
