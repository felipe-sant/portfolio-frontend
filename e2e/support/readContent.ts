import { readFileSync } from "node:fs"
import { resolve } from "node:path"

function readContent(language: string, file: string): unknown {
    return JSON.parse(readFileSync(resolve("public/content", language, `${file}.json`), "utf-8"))
}

export default readContent
