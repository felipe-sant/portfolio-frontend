import type PrerenderResult from "@/types/prerender/PrerenderResult.types"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"

declare module "vitest" {
    interface ProvidedContext {
        prerenderFixtures: { target: PrerenderTarget; result: PrerenderResult }[]
    }
}
