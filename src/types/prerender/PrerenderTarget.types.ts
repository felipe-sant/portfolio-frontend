import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type PrerenderParams from "@/types/prerender/PrerenderParams.types"

type PrerenderTarget = {
    path: string
    file: string
    lang: SupportedLanguage
    pattern?: string
    params?: PrerenderParams
}

export default PrerenderTarget
