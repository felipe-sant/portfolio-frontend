import { describe, expect, it, vi } from "vitest"
import { createMemoryRouter, Link, RouterProvider, useLocation } from "react-router-dom"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import useBackToProjects from "@/pages/hooks/useBackToProjects"

function Back() {
    const { to, onClick } = useBackToProjects()
    const location = useLocation()

    return (
        <>
            <Link
                to={to}
                onClick={onClick}
                onClickCapture={(event) => {
                    if (new URLSearchParams(location.search).has("prevent")) {
                        event.preventDefault()
                    }
                }}
            >
                {"Voltar"}
            </Link>
            <output>{`${location.pathname}${location.search}`}</output>
        </>
    )
}

function mount(entries: Parameters<typeof createMemoryRouter>[1] = {}) {
    const router = createMemoryRouter([{ path: "*", element: <Back /> }], entries)
    render(<RouterProvider router={router} />)

    return router
}

describe("useBackToProjects", () => {
    it("com a marca, o clique volta pelo histórico à lista, depois de abrir dois documentos", async () => {
        const user = userEvent.setup()
        const router = mount({
            initialEntries: [
                { pathname: "/pt-BR/projects", search: "?type=web", state: { pages: 2 } },
                { pathname: "/pt-BR/projects/abc", state: { fromProjects: true } },
                {
                    pathname: "/pt-BR/projects/abc/docs/SETUP.md",
                    state: { fromProjects: true, documentSteps: 1 }
                },
                {
                    pathname: "/pt-BR/projects/abc/docs/LICENSE",
                    state: { fromProjects: true, documentSteps: 2 }
                }
            ],
            initialIndex: 3
        })

        await user.click(screen.getByRole("link", { name: "Voltar" }))

        expect(router.state.location.pathname).toBe("/pt-BR/projects")
        expect(router.state.location.search).toBe("?type=web")
        expect(router.state.location.state).toEqual({ pages: 2 })
    })

    it("com a marca e sem documentos, volta uma entrada", async () => {
        const user = userEvent.setup()
        const router = mount({
            initialEntries: [
                { pathname: "/pt-BR/projects", search: "?q=a" },
                { pathname: "/pt-BR/projects/abc", state: { fromProjects: true } }
            ],
            initialIndex: 1
        })

        await user.click(screen.getByRole("link", { name: "Voltar" }))

        expect(router.state.location.search).toBe("?q=a")
    })

    it("sem a marca, o clique segue o href para /projects sem query", async () => {
        const user = userEvent.setup()
        const router = mount({
            initialEntries: ["/pt-BR/projects/abc?x=1"]
        })

        expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute(
            "href",
            "/pt-BR/projects"
        )

        await user.click(screen.getByRole("link", { name: "Voltar" }))

        expect(router.state.location.pathname).toBe("/pt-BR/projects")
        expect(router.state.location.search).toBe("")
    })

    it("com a marca, o clique com Ctrl não é interceptado", async () => {
        const user = userEvent.setup()
        const router = mount({
            initialEntries: [
                { pathname: "/pt-BR/projects", search: "?q=a" },
                { pathname: "/pt-BR/projects/abc", state: { fromProjects: true } }
            ],
            initialIndex: 1
        })

        await user.keyboard("{Control>}")
        await user.click(screen.getByRole("link", { name: "Voltar" }))
        await user.keyboard("{/Control}")

        expect(router.state.location.pathname).toBe("/pt-BR/projects/abc")
    })

    it.each([["Meta"], ["Shift"], ["Alt"]])(
        "com a marca, o clique com %s não é interceptado",
        async (key) => {
            const user = userEvent.setup()
            const router = mount({
                initialEntries: [
                    { pathname: "/pt-BR/projects", search: "?q=a" },
                    { pathname: "/pt-BR/projects/abc", state: { fromProjects: true } }
                ],
                initialIndex: 1
            })
            const history = vi.spyOn(router, "navigate")

            await user.keyboard(`{${key}>}`)
            await user.click(screen.getByRole("link", { name: "Voltar" }))
            await user.keyboard(`{/${key}}`)

            expect(history).not.toHaveBeenCalledWith(-1)
        }
    )

    it("com a marca, o clique com o botão do meio não volta pelo histórico", () => {
        const router = mount({
            initialEntries: [
                { pathname: "/pt-BR/projects", search: "?q=a" },
                { pathname: "/pt-BR/projects/abc", state: { fromProjects: true } }
            ],
            initialIndex: 1
        })
        const history = vi.spyOn(router, "navigate")

        fireEvent.click(screen.getByRole("link", { name: "Voltar" }), { button: 1 })

        expect(history).not.toHaveBeenCalledWith(-1)
    })

    it("com a marca, não volta pelo histórico se o clique já foi cancelado", () => {
        const router = mount({
            initialEntries: [
                { pathname: "/pt-BR/projects", search: "?q=a" },
                {
                    pathname: "/pt-BR/projects/abc",
                    search: "?prevent",
                    state: { fromProjects: true }
                }
            ],
            initialIndex: 1
        })
        const history = vi.spyOn(router, "navigate")

        fireEvent.click(screen.getByRole("link", { name: "Voltar" }))

        expect(history).not.toHaveBeenCalledWith(-1)
    })
})
