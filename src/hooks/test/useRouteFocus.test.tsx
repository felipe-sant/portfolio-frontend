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
                    { path: "pt-BR/projects", element: <h1>Projetos</h1> },
                    { path: "pt-BR/projects/:id", element: <h1>Projeto</h1> },
                    { path: "pt-BR/projects/:id/docs/:name", element: <h1>Projeto</h1> },
                    { path: "en/projects/:id/docs/:name", element: <h1>Project</h1> },
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

    describe("troca dentro do mesmo projeto", () => {
        const FIRST = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"
        const SECOND = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f51"

        it.each([
            [`/pt-BR/projects/${FIRST}`, `/pt-BR/projects/${FIRST}/docs/SETUP.md`],
            [`/pt-BR/projects/${FIRST}/docs/SETUP.md`, `/pt-BR/projects/${FIRST}/docs/LICENSE`],
            [`/pt-BR/projects/${FIRST}/docs/SETUP.md`, `/pt-BR/projects/${FIRST}`]
        ])("não foca o h1 de %s para %s", async (from, to) => {
            const router = renderRoutes([from])

            await act(async () => {
                await router.navigate(to)
            })

            expect(document.body).toHaveFocus()
        })

        it.each([
            [`/pt-BR/projects/${FIRST}`, `/pt-BR/projects/${SECOND}`],
            ["/pt-BR/projects", `/pt-BR/projects/${FIRST}`],
            ["/pt-BR/about", `/pt-BR/projects/${FIRST}/docs/SETUP.md`],
            [`/pt-BR/projects/${FIRST}/docs/SETUP.md`, `/pt-BR/projects/${SECOND}`]
        ])("continua focando o h1 de %s para %s", async (from, to) => {
            const router = renderRoutes([from])

            await act(async () => {
                await router.navigate(to)
            })

            expect(document.activeElement?.tagName).toBe("H1")
        })

        it("não foca o h1 ao trocar só o idioma de um documento", async () => {
            const router = renderRoutes([`/pt-BR/projects/${FIRST}/docs/SETUP.md`])

            await act(async () => {
                await router.navigate(`/en/projects/${FIRST}/docs/SETUP.md`)
            })

            expect(document.body).toHaveFocus()
        })
    })
})
