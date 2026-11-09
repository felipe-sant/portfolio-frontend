import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import composePage from "@scripts/prerender/composePage"
import type PrerenderResult from "@/types/prerender/PrerenderResult.types"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"

function composeFinalHtml(result: PrerenderResult, target: PrerenderTarget): string {
    const template = readFileSync(resolve(process.cwd(), "index.html"), "utf-8")

    return composePage(template, result, target, "", "/")
}

export default composeFinalHtml
