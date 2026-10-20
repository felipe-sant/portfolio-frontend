import { describe, expect, it } from "vitest"
import { lazy, Suspense, useRef } from "react"
import { act, render, screen } from "@testing-library/react"
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom"
import useRouteFocus from "@/hooks/useRouteFocus"

function Frame() {
    const mainRef = useRef<HTMLElement>(null)
    useRouteFocus(mainRef)

    return (
        <main ref={mainRef}>
            <Suspense fallback={<p>carregando</p>}>
                <Outlet />
            </Suspense>
        </main>
    )
}

function createLazyPage(resolveRef: { resolve: () => void }) {
    return lazy(
        () =>
            new Promise<{ default: () => React.JSX.Element }>((resolve) => {
                resolveRef.resolve = () => resolve({ default: () => <h1>Página lenta</h1> })
            })
    )
}

function renderRoutes(
    initialEntries: string[],
    extra: { path: string; element: React.JSX.Element }[] = []
) {
    const router = createMemoryRouter(
        [
            {
                path: "/",
                element: <Frame />,
                children: [
                    { path: "pt-BR", element: <h1>Início</h1> },
                    { path: "en", element: <h1>Home</h1> },
                    { path: "pt-BR/about", element: <h1>Sobre</h1> },
                    { path: "en/about", element: <h1>About</h1> },
                    ...extra
                ]
            }
        ],
        { initialEntries }
    )
    render(<RouterProvider router={router} />)
    return router
}

describe("useRouteFocus", () => {
    it("não move o foco na primeira carga", () => {
        renderRoutes(["/pt-BR"])

        expect(document.body).toHaveFocus()
    })

    it("foca o h1 na navegação interna", async () => {
        const router = renderRoutes(["/pt-BR"])

        await act(async () => {
            await router.navigate("/pt-BR/about")
        })

        expect(screen.getByRole("heading", { name: "Sobre" })).toHaveFocus()
        expect(screen.getByRole("heading", { name: "Sobre" })).toHaveAttribute("tabindex", "-1")
    })

    it("espera o h1 de uma rota lazy e foca quando ele aparece", async () => {
        const control = { resolve: () => {} }
        const LazyPage = createLazyPage(control)
        const router = renderRoutes(["/pt-BR"], [{ path: "pt-BR/lazy", element: <LazyPage /> }])

        await act(async () => {
            await router.navigate("/pt-BR/lazy")
        })

        await act(async () => {
            control.resolve()
        })

        expect(await screen.findByRole("heading", { name: "Página lenta" })).toHaveFocus()
    })

    it("não move o foco ao trocar só o idioma", async () => {
        const router = renderRoutes(["/pt-BR/about"])

        await act(async () => {
            await router.navigate("/en/about")
        })

        expect(document.body).toHaveFocus()
    })
})
