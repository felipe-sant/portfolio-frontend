import profileApi from "@/store/api/profile.api"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"
import type PrerenderParams from "@/types/prerender/PrerenderParams.types"
import type PrerenderRoute from "@/types/prerender/PrerenderRoute.types"
import type AppStore from "@/types/store/AppStore.types"

function describeError(error: unknown): string {
    if (typeof error === "object" && error !== null && "data" in error) {
        return JSON.stringify(error.data)
    }

    return String(error)
}

async function loadPrerenderData(
    store: AppStore,
    route: PrerenderRoute,
    params: PrerenderParams,
    lang: SupportedLanguage
) {
    const footerQuery = (dispatch: AppStore["dispatch"]) =>
        dispatch(profileApi.endpoints.getProfile.initiate({ lang }))
    const subscriptions = [footerQuery, ...route.queries(lang, params)].map((query) =>
        query(store.dispatch)
    )

    try {
        const results = await Promise.all(subscriptions)
        const failed = results.find((result) => result.isError)

        if (failed) {
            throw new Error(
                `Falha ao carregar os dados da rota "${route.pattern}" (${lang}): ${describeError(failed.error)}`
            )
        }
    } finally {
        subscriptions.forEach((subscription) => subscription.unsubscribe())
    }
}

export default loadPrerenderData
