import { Provider } from "react-redux"
import Router from "./routers/Router"
import useMotion from "@/hooks/useMotion"
import useTheme from "@/hooks/useTheme"
import store from "@/store/store"
import "@/i18n/i18n"
import "./styles/global.css"

function App() {
    useTheme()
    useMotion()

    return (
        <Provider store={store}>
            <Router />
        </Provider>
    )
}

export default App
