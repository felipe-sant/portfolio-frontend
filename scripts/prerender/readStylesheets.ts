import { readdir, readFile } from "node:fs/promises"
import { join } from "node:path"
import type Stylesheet from "@/types/prerender/Stylesheet.types"

async function readStylesheets(assetsDirectory: string, base: string): Promise<Stylesheet[]> {
    const files = (await readdir(assetsDirectory))
        .filter((file) => file.endsWith(".css"))
        .toSorted()

    return Promise.all(
        files.map(async (file) => ({
            href: `${base}assets/${file}`,
            content: await readFile(join(assetsDirectory, file), "utf-8")
        }))
    )
}

export default readStylesheets
