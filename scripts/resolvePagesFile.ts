import { statSync } from "node:fs"
import { join, resolve, sep } from "node:path"
import type PagesResolution from "@/types/prerender/PagesResolution.types"

function isFile(path: string): boolean {
    try {
        return statSync(path).isFile()
    } catch {
        return false
    }
}

function isDirectory(path: string): boolean {
    try {
        return statSync(path).isDirectory()
    } catch {
        return false
    }
}

function notFound(directory: string): PagesResolution {
    return { status: 404, file: join(directory, "404.html") }
}

function decode(path: string): string | null {
    try {
        return decodeURIComponent(path)
    } catch {
        return null
    }
}

function resolvePagesFile(directory: string, relativePath: string): PagesResolution {
    const decoded = decode(relativePath)

    if (decoded === null) {
        return notFound(directory)
    }

    const root = resolve(directory)
    const resolved = resolve(join(directory, decoded))

    if (decoded.includes("\0") || (resolved !== root && !resolved.startsWith(`${root}${sep}`))) {
        return notFound(directory)
    }

    const hasTrailingSlash = decoded === "" || decoded.endsWith("/")
    const trimmed = decoded.replace(/\/+$/, "")
    const target = join(directory, trimmed)

    if (hasTrailingSlash) {
        const index = join(target, "index.html")
        return isFile(index) ? { status: 200, file: index } : notFound(directory)
    }

    if (isFile(target)) {
        return { status: 200, file: target }
    }

    if (isFile(`${target}.html`)) {
        return { status: 200, file: `${target}.html` }
    }

    if (isDirectory(target) && isFile(join(target, "index.html"))) {
        return { status: 301, location: `${relativePath}/` }
    }

    return notFound(directory)
}

export default resolvePagesFile
