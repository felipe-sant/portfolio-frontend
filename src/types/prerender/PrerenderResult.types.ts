import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

type PrerenderResult = {
    html: string
    state: string
    routerData: string
    language: SupportedLanguage
}

export default PrerenderResult
