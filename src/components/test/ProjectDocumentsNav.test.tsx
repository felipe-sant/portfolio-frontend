import { describe, expect, it } from "vitest"
import { createMemoryRouter, MemoryRouter, RouterProvider } from "react-router-dom"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProjectDocumentsNav from "@/components/ProjectDocumentsNav"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type ProjectDocument from "@/types/project/ProjectDocument.types"

const ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"

function buildDocuments(names: string[]): ProjectDocument[] {
    return names.map((name, index) => ({
        id: `0192f1d0-2b3c-7d4e-8f50-61728394a5b${index}`,
        name,
        format: "markdown",
        translated: true
    }))
}

function renderNav(names: string[], current: string) {
    return render(
        <MemoryRouter>
            <ProjectDocumentsNav
                projectId={ID}
                projectTitle={"Maps"}
                documents={buildDocuments(names)}
                current={current}
            />
        </MemoryRouter>
    )
}

describe("ProjectDocumentsNav", () => {
    it("aparece com um link mesmo com só o README", () => {
        renderNav(["README.md"], "README.md")

        expect(
            screen.getByRole("navigation", { name: "Documentação do projeto" })
        ).toBeInTheDocument()
        expect(screen.getAllByRole("link")).toHaveLength(1)
    })

    it("mostra um link por documento na ordem recebida com texto igual ao nome e nome acessível com o projeto", () => {
        renderNav(["README.md", "SETUP.md", "LICENSE"], "README.md")
        const links = screen.getAllByRole("link")

        expect(links.map((link) => link.textContent)).toEqual(["README.md", "SETUP.md", "LICENSE"])
        expect(links.map((link) => link.getAttribute("aria-label"))).toEqual([
            "README.md: Maps",
            "SETUP.md: Maps",
            "LICENSE: Maps"
        ])
    })

    it("liga o README ao projeto e os outros ao documento, com o prefixo do idioma", async () => {
        renderNav(["README.md", "SETUP.md"], "README.md")

        expect(screen.getByRole("link", { name: "README.md: Maps" })).toHaveAttribute(
            "href",
            `/pt-BR/projects/${ID}`
        )
        expect(screen.getByRole("link", { name: "SETUP.md: Maps" })).toHaveAttribute(
            "href",
            `/pt-BR/projects/${ID}/docs/SETUP.md`
        )

        await act(() => setLanguage("es"))

        expect(screen.getByRole("link", { name: "SETUP.md: Maps" })).toHaveAttribute(
            "href",
            `/es/projects/${ID}/docs/SETUP.md`
        )
    })

    it("marca só o documento aberto com aria-current page", () => {
        renderNav(["README.md", "SETUP.md", "LICENSE"], "SETUP.md")
        const links = screen.getAllByRole("link")

        expect(links.map((link) => link.getAttribute("aria-current"))).toEqual([null, "page", null])
    })

    it("navega sem recarregar, sem resetar a rolagem e soma documentSteps quando há a marca", async () => {
        const user = userEvent.setup()
        const router = createMemoryRouter(
            [
                {
                    path: "*",
                    element: (
                        <ProjectDocumentsNav
                            projectId={ID}
                            projectTitle={"Maps"}
                            documents={buildDocuments(["README.md", "SETUP.md", "LICENSE"])}
                            current={"README.md"}
                        />
                    )
                }
            ],
            {
                initialEntries: [
                    { pathname: `/pt-BR/projects/${ID}`, state: { fromProjects: true } }
                ]
            }
        )
        render(<RouterProvider router={router} />)

        await user.click(screen.getByRole("link", { name: "SETUP.md: Maps" }))

        expect(router.state.location.pathname).toBe(`/pt-BR/projects/${ID}/docs/SETUP.md`)
        expect(router.state.location.state).toEqual({ fromProjects: true, documentSteps: 1 })
        expect(router.state.preventScrollReset).toBe(true)
        expect(router.state.historyAction).toBe("PUSH")

        await user.click(screen.getByRole("link", { name: "LICENSE: Maps" }))

        expect(router.state.location.state).toEqual({ fromProjects: true, documentSteps: 2 })
    })

    it("navega sem estado quando a entrada atual não tem a marca", async () => {
        const user = userEvent.setup()
        const router = createMemoryRouter(
            [
                {
                    path: "*",
                    element: (
                        <ProjectDocumentsNav
                            projectId={ID}
                            projectTitle={"Maps"}
                            documents={buildDocuments(["README.md", "SETUP.md"])}
                            current={"README.md"}
                        />
                    )
                }
            ],
            { initialEntries: [`/pt-BR/projects/${ID}`] }
        )
        render(<RouterProvider router={router} />)

        await user.click(screen.getByRole("link", { name: "SETUP.md: Maps" }))

        expect(router.state.location.state).toBeNull()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderNav(["README.md", "SETUP.md"], "SETUP.md")

        await expectNoAxeViolations(container)
    }, 15000)
})
