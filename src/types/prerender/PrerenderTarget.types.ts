import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

type PrerenderTarget = {
    path: string
    file: string
    lang: SupportedLanguage
    status?: number
}

export default PrerenderTarget
