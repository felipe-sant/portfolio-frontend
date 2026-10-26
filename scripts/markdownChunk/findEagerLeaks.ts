import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"

const EAGER_CHUNKS = /^(index|Home\.page|Projects\.page)-.+\.js$/
const MARKDOWN_MARKER = "unwrapDisallowed"

async function findEagerLeaks(assetsDirectory: string): Promise<string[]> {
    const names = (await readdir(assetsDirectory)).filter((name) => EAGER_CHUNKS.test(name))
    const leaks = await Promise.all(
        names.map(async (name) =>
            (await readFile(join(assetsDirectory, name), "utf-8")).includes(MARKDOWN_MARKER)
                ? [name]
                : []
        )
    )

    return leaks.flat()
}

export default findEagerLeaks
