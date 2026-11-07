import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"

type SeoFilesOptions = {
    publicDirectory: string
    outputDirectory: string
    origin: string
    base: string
    targets: PrerenderTarget[]
}

export default SeoFilesOptions
