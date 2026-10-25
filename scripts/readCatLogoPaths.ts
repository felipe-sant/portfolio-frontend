import { readFileSync } from "node:fs"

type CatLogoPath = {
    d: string
    role: "body" | "detail"
}

const PATH_PATTERN = /<path\s+className=\{css\.(body|detail)\}\s+d="([^"]+)"/g

function readCatLogoPaths(file: string): CatLogoPath[] {
    const source = readFileSync(file, "utf-8")
    const seen = new Set<string>()
    const paths: CatLogoPath[] = []

    for (const match of source.matchAll(PATH_PATTERN)) {
        const d = match[2]

        if (!seen.has(d)) {
            seen.add(d)
            paths.push({ d, role: match[1] === "body" ? "body" : "detail" })
        }
    }

    return paths
}

export default readCatLogoPaths
