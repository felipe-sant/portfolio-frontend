import { lazy } from "react"
import type { RouteObject } from "react-router-dom"
import FALLBACK_LANGUAGE from "@/i18n/fallbackLanguage"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import MainLayout from "@/layouts/Main.layout"
import ErrorPage from "@/pages/Error.page"
import createLanguageLoader from "@/routers/createLanguageLoader"
import ROUTES from "@/routers/paths"
import redirectRootLoader from "@/routers/redirectRootLoader"
import type SupportedLanguage from "@/types/language/SupportedLanguage.types"

const Home = lazy(() => import("@/pages/Home.page"))
const NotFound = lazy(() => import("@/pages/NotFound.page"))
const Project = lazy(() => import("@/pages/Project.page"))
const Projects = lazy(() => import("@/pages/Projects.page"))

const pageRoutes: RouteObject[] = [
    {
        index: true,
        element: <Home />
    },
    {
        path: ROUTES.projects.slice(1),
        element: <Projects />
    },
    {
        path: ROUTES.project.slice(1),
        element: <Project />,
        children: [
            { index: true, element: null },
            { path: "docs/:name", element: null }
        ]
    },
    {
        path: ROUTES.notFound,
        element: <NotFound />,
        handle: { hideFooter: true }
    }
]

function createLanguageRoute(language: SupportedLanguage): RouteObject {
    return {
        path: language,
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        loader: createLanguageLoader(language),
        children: pageRoutes
    }
}

const routes: RouteObject[] = [
    ...SUPPORTED_LANGUAGES.map(createLanguageRoute),
    {
        path: ROUTES.root,
        loader: redirectRootLoader
    },
    {
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        loader: createLanguageLoader(FALLBACK_LANGUAGE),
        children: [
            {
                path: ROUTES.notFound,
                element: <NotFound />,
                handle: { hideFooter: true }
            }
        ]
    }
]

export default routes
