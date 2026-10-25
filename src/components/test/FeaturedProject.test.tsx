import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, render, screen } from "@testing-library/react"
import FeaturedProject from "@/components/FeaturedProject"
import setLanguage from "@/i18n/setLanguage"
import buildProjectSummary from "@/testUtils/buildProjectSummary"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type ProjectSummary from "@/types/project/ProjectSummary.types"

function renderItem(overrides: Partial<ProjectSummary> = {}) {
    const project = buildProjectSummary(overrides)

    return {
        project,
        ...render(
            <MemoryRouter>
                <FeaturedProject project={project} index={0} viewProjectLabel="Ver projeto" />
            </MemoryRouter>
        )
    }
}

describe("FeaturedProject", () => {
    it("renderiza um article com um único link para o projeto", () => {
        const { project, container } = renderItem()

        expect(container.querySelector("article")).toBeInTheDocument()
        expect(screen.getAllByRole("link")).toHaveLength(1)
        expect(screen.getByRole("link", { name: project.title })).toHaveAttribute(
            "href",
            `/pt-BR/projects/${project.id}`
        )
    })

    it("usa o prefixo do idioma ativo no link", async () => {
        const { project } = renderItem()

        await act(() => setLanguage("en"))

        expect(screen.getByRole("link", { name: project.title })).toHaveAttribute(
            "href",
            `/en/projects/${project.id}`
        )
    })

    it("renderiza a capa responsiva decorativa", () => {
        const { container } = renderItem()
        const image = container.querySelector("img")

        expect(image).toHaveAttribute("alt", "")
        expect(image).toHaveAttribute("loading", "lazy")
        expect(image).toHaveAttribute("decoding", "async")
        expect(image?.getAttribute("srcset")).toContain("640w")
        expect(image?.getAttribute("srcset")).toContain("1280w")
        expect(image).toHaveAttribute("width", "1280")
        expect(image).toHaveAttribute("height", "720")
    })

    it("renderiza o placeholder sem capa", () => {
        const { container } = renderItem({ cover: undefined })

        expect(container.querySelector("img")).not.toBeInTheDocument()
        expect(container.querySelector('div[aria-hidden="true"]')).toBeInTheDocument()
    })

    it("mostra os metadados com separadores ocultos", () => {
        const { container } = renderItem()
        const meta = container.querySelector("p")

        expect(meta).toHaveTextContent("Web")
        expect(meta).toHaveTextContent("API")
        expect(meta).toHaveTextContent("Pessoal")
        expect(meta).toHaveTextContent("2026")
        expect(meta?.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(3)
    })

    it("mostra no máximo três tecnologias", () => {
        renderItem({ cardTechnologies: ["A", "B", "C", "D", "E"] })

        expect(screen.getAllByRole("listitem")).toHaveLength(3)
    })

    it("esconde o texto Ver projeto dos leitores de tela", () => {
        renderItem()

        expect(screen.getByText(/Ver projeto/)).toHaveAttribute("aria-hidden", "true")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderItem()

        await expectNoAxeViolations(container)
    }, 15000)
})
