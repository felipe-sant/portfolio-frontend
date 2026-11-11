import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { createBrowserRouter } from "react-router-dom"
import App from "@/App"
import routes from "@/routers/routes"
import createStore from "@/store/createStore"
import loadMarkdownRenderer from "@/utils/loadMarkdownRenderer"
import publicUrl from "@/utils/publicUrl"
import readPrerenderData from "@/utils/readPrerenderData"
import removePrerenderedHead from "@/utils/removePrerenderedHead"
import shouldHydrate from "@/utils/shouldHydrate"
import shouldPreloadMarkdown from "@/utils/shouldPreloadMarkdown"

async function mountClient(rootElement: HTMLElement) {
    const prerenderData = readPrerenderData(document)
    const hydrationSource = shouldHydrate(prerenderData?.path, window.location.pathname)
        ? prerenderData
        : undefined
    const store = createStore(hydrationSource?.state)
    const router = createBrowserRouter(routes, {
        basename: publicUrl("/"),
        hydrationData: hydrationSource?.routerData
    })
    const app = (
        <StrictMode>
            <App store={store} router={router} />
        </StrictMode>
    )

    if (hydrationSource) {
        if (shouldPreloadMarkdown(window.location.pathname, hydrationSource.state)) {
            await loadMarkdownRenderer()
        }

        return hydrateRoot(rootElement, app)
    }

    removePrerenderedHead(document.head)
    const root = createRoot(rootElement)
    root.render(app)

    return root
}

export default mountClient
