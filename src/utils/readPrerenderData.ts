import type PrerenderData from "@/types/prerender/PrerenderData.types"
import PRERENDER_DATA_ID from "@/utils/prerenderDataId"

function isObject(value: unknown): value is object {
    return typeof value === "object" && value !== null
}

function isPrerenderData(value: unknown): value is PrerenderData {
    return (
        isObject(value) &&
        "path" in value &&
        typeof value.path === "string" &&
        "state" in value &&
        isObject(value.state) &&
        "routerData" in value &&
        isObject(value.routerData)
    )
}

function parseJson(text: string): unknown {
    try {
        return JSON.parse(text)
    } catch {
        return undefined
    }
}

function readPrerenderData(root: Document): PrerenderData | undefined {
    const text = root.getElementById(PRERENDER_DATA_ID)?.textContent?.trim() ?? ""

    if (text === "") {
        return undefined
    }

    const value = parseJson(text)

    return isPrerenderData(value) ? value : undefined
}

export default readPrerenderData
