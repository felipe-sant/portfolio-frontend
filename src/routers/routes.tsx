import { lazy } from "react"
import type { RouteObject } from "react-router-dom"
import MainLayout from "@/layouts/Main.layout"
import ErrorPage from "@/pages/Error.page"
import ROUTES from "@/routers/paths"

const Home = lazy(() => import("@/pages/Home.page"))
const NotFound = lazy(() => import("@/pages/NotFound.page"))

const routes: RouteObject[] = [
    {
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: ROUTES.home,
                element: <Home />
            },
            {
                path: ROUTES.notFound,
                element: <NotFound />
            }
        ]
    }
]

export default routes
