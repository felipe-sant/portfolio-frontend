import { createReadStream } from "node:fs"
import { createServer } from "node:http"
import { extname, join } from "node:path"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import resolvePagesFile from "@scripts/resolvePagesFile"
import type PagesResolution from "@/types/prerender/PagesResolution.types"

const DIRECTORY = "dist"
const PORT = 4173
const BASE_WITHOUT_SLASH = FATEC_BASE_PATH.replace(/\/$/, "")

const CONTENT_TYPES: Record<string, string> = {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".woff2": "font/woff2",
    ".webp": "image/webp",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".pdf": "application/pdf",
    ".md": "text/markdown; charset=utf-8"
}

const server = createServer((request, response) => {
    const { pathname } = new URL(request.url ?? "/", "http://localhost")

    if (pathname === BASE_WITHOUT_SLASH) {
        response.writeHead(301, { Location: FATEC_BASE_PATH })
        response.end()
        return
    }

    const relativePath = pathname.startsWith(FATEC_BASE_PATH)
        ? pathname.slice(FATEC_BASE_PATH.length)
        : null
    const resolution: PagesResolution =
        relativePath === null
            ? { status: 404, file: join(DIRECTORY, "404.html") }
            : resolvePagesFile(DIRECTORY, relativePath)

    if (resolution.status === 301 && resolution.location !== undefined) {
        response.writeHead(301, { Location: `${FATEC_BASE_PATH}${resolution.location}` })
        response.end()
        return
    }

    const contentType = CONTENT_TYPES[extname(resolution.file ?? "")] ?? "application/octet-stream"
    response.writeHead(resolution.status, { "Content-Type": contentType })

    if (resolution.file === undefined) {
        response.end()
        return
    }

    createReadStream(resolution.file).pipe(response)
})

server.listen(PORT, () => {
    console.log(`Pages da Fatec em http://localhost:${PORT}${FATEC_BASE_PATH}`)
})
