import { join } from "node:path"
import { pathToFileURL } from "node:url"
import type { RouteObject } from "react-router-dom"
import type PrerenderResult from "@/types/prerender/PrerenderResult.types"
import type PrerenderRouteDescriptor from "@/types/prerender/PrerenderRouteDescriptor.types"
import type PrerenderTarget from "@/types/prerender/PrerenderTarget.types"

type ServerBundle = {
    render: (target: PrerenderTarget) => Promise<PrerenderResult>
    routes: RouteObject[]
    prerenderRoutes: PrerenderRouteDescriptor[]
}

async function importDefault(directory: string, name: string): Promise<unknown> {
    const file = join(process.cwd(), directory, `${name}.js`)
    const loaded: unknown = await import(pathToFileURL(file).href)

    if (typeof loaded !== "object" || loaded === null || !("default" in loaded)) {
        throw new Error(`O módulo ${name}.js em "${directory}" não tem export default.`)
    }

    return loaded.default
}

async function loadServerBundle(directory: string): Promise<ServerBundle> {
    const render = await importDefault(directory, "entry-server")
    const routes = await importDefault(directory, "routes")
    const prerenderRoutes = await importDefault(directory, "prerenderRoutes")

    if (typeof render !== "function") {
        throw new Error(`O entry-server.js em "${directory}" não exporta a função render.`)
    }

    if (!Array.isArray(routes) || !Array.isArray(prerenderRoutes)) {
        throw new Error(
            `Os módulos routes.js e prerenderRoutes.js em "${directory}" devem exportar listas.`
        )
    }

    return { render: (target) => render(target), routes, prerenderRoutes }
}

export default loadServerBundle
