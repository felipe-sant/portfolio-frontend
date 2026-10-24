import { prerender } from "react-dom/static"
import { Provider } from "react-redux"
import { createStaticHandler, createStaticRouter, StaticRouterProvider } from "react-router-dom"
import getLanguage from "@/i18n/getLanguage"
import loadPrerenderData from "@/prerender/loadPrerenderData"
import prerenderRoutes from "@/prerender/prerenderRoutes"
import routes from "@/routers/routes"
import api from "@/store/api"
import createStore from "@/store/createStore"
import publicUrl from "@/utils/publicUrl"
import type PrerenderResult from "@/types/prerender/PrerenderResult.types"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"

function toScriptJson(value: unknown): string {
    return JSON.stringify(value).replace(/</g, "\\u003c")
}

async function render(target: PrerenderTarget): Promise<PrerenderResult> {
    const handler = createStaticHandler(routes, { basename: publicUrl("/") })
    const context = await handler.query(new Request(`http://localhost${publicUrl(target.path)}`))

    if (context instanceof Response) {
        throw new Error(
            `A rota "${target.path}" respondeu ${context.status} direto e não pode ser pré-renderizada.`
        )
    }

    const route = prerenderRoutes.find((candidate) => candidate.pattern === target.pattern)

    if (target.pattern !== undefined && !route) {
        throw new Error(`A rota "${target.pattern}" não está no registro de pré-renderização.`)
    }

    const store = createStore()
    await loadPrerenderData(store, route, target.params ?? {}, target.lang)

    const router = createStaticRouter(handler.dataRoutes, context)
    const { prelude } = await prerender(
        <Provider store={store}>
            <StaticRouterProvider router={router} context={context} hydrate={false} />
        </Provider>,
        { progressiveChunkSize: Infinity }
    )
    const html = await new Response(prelude).text()
    const state = toScriptJson(store.getState())
    store.dispatch(api.util.resetApiState())

    return {
        html,
        state,
        routerData: toScriptJson({
            loaderData: context.loaderData,
            actionData: context.actionData,
            errors: context.errors
        }),
        language: getLanguage()
    }
}

export default render
