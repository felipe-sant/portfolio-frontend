import { readFile } from "node:fs/promises"
import { gzipSync } from "node:zlib"

async function measureGzipSize(files: string[]): Promise<number> {
    const sizes = await Promise.all(
        files.map(async (file) => gzipSync(await readFile(file)).length)
    )

    return sizes.reduce((total, size) => total + size, 0)
}

export default measureGzipSize
