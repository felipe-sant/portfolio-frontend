import type { ComponentProps } from "react"
import { Provider } from "react-redux"
import { RouterProvider } from "react-router-dom"
import useMotion from "@/hooks/useMotion"
import useTheme from "@/hooks/useTheme"
import type AppStore from "@/types/store/AppStore.types"
import "@/i18n/i18n"
import "./styles/global.css"

type AppProps = {
    store: AppStore
    router: ComponentProps<typeof RouterProvider>["router"]
}

function App({ store, router }: AppProps) {
    useTheme()
    useMotion()

    return (
        <Provider store={store}>
            <RouterProvider router={router} />
        </Provider>
    )
}

export default App
