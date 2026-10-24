import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type PrerenderParams from "@/types/prerender/PrerenderParams.types"

type PrerenderTarget = {
    path: string
    file: string
    lang: SupportedLanguage
    status?: number
    pattern?: string
    params?: PrerenderParams
}

export default PrerenderTarget
