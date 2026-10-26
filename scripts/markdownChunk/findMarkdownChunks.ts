import { readdir } from "node:fs/promises"
import { join } from "node:path"

const MARKDOWN_CHUNK = /^MarkdownDocument-.+\.js$/

async function findMarkdownChunks(assetsDirectory: string): Promise<string[]> {
    const names = await readdir(assetsDirectory)

    return names
        .filter((name) => MARKDOWN_CHUNK.test(name))
        .map((name) => join(assetsDirectory, name))
}

export default findMarkdownChunks
