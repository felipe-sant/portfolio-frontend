import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type PrerenderParams from "@/types/prerender/PrerenderParams.types"
import type PrerenderQuery from "@/types/prerender/PrerenderQuery.types"

type PrerenderRoute = {
    pattern: string
    scope: "none" | "project" | "document"
    queries: (lang: SupportedLanguage, params: PrerenderParams) => PrerenderQuery[]
}

export default PrerenderRoute
