import { useState } from "react"
import { createBrowserRouter, RouterProvider } from "react-router-dom"
import routes from "@/routers/routes"
import publicUrl from "@/utils/publicUrl"

function Router() {
    const [router] = useState(() => createBrowserRouter(routes, { basename: publicUrl("/") }))

    return <RouterProvider router={router} />
}

export default Router
