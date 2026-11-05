import { readdir } from "node:fs/promises"
import { join } from "node:path"

const MODULE_CHUNK = /^pdf-.+\.js$/
const WORKER_CHUNK = /^pdf\.worker\.min-.+\.mjs$/

type PdfChunks = { modules: string[]; workers: string[] }

async function findPdfChunks(assetsDirectory: string): Promise<PdfChunks> {
    const names = await readdir(assetsDirectory)
    const resolve = (pattern: RegExp) =>
        names.filter((name) => pattern.test(name)).map((name) => join(assetsDirectory, name))

    return { modules: resolve(MODULE_CHUNK), workers: resolve(WORKER_CHUNK) }
}

export default findPdfChunks
