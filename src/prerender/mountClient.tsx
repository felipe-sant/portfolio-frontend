import { StrictMode } from "react"
import { createRoot, hydrateRoot } from "react-dom/client"
import { createBrowserRouter } from "react-router-dom"
import App from "@/App"
import routes from "@/routers/routes"
import createStore from "@/store/createStore"
import publicUrl from "@/utils/publicUrl"
import removePrerenderedHead from "@/utils/removePrerenderedHead"
import shouldHydrate from "@/utils/shouldHydrate"

function mountClient(rootElement: HTMLElement) {
    const hydrate = shouldHydrate(window.prerenderedPath, window.location.pathname)
    const store = createStore(hydrate ? window.preloadedState : undefined)
    const router = createBrowserRouter(routes, {
        basename: publicUrl("/"),
        hydrationData: hydrate ? window.routerData : undefined
    })
    const app = (
        <StrictMode>
            <App store={store} router={router} />
        </StrictMode>
    )

    if (hydrate) {
        return hydrateRoot(rootElement, app)
    }

    removePrerenderedHead(document.head)
    const root = createRoot(rootElement)
    root.render(app)

    return root
}

export default mountClient
