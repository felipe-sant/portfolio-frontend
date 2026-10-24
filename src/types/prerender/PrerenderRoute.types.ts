import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type PrerenderParams from "@/types/prerender/PrerenderParams.types"
import type PrerenderQuery from "@/types/prerender/PrerenderQuery.types"
import type PrerenderRouteDescriptor from "@/types/prerender/PrerenderRouteDescriptor.types"

type PrerenderRoute = PrerenderRouteDescriptor & {
    queries: (lang: SupportedLanguage, params: PrerenderParams) => PrerenderQuery[]
}

export default PrerenderRoute
