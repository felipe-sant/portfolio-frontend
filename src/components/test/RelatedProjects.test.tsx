import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, render, screen } from "@testing-library/react"
import RelatedProjects from "@/components/RelatedProjects"
import setLanguage from "@/i18n/setLanguage"
import buildProjectSummary from "@/testUtils/buildProjectSummary"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type RelatedProject from "@/types/project/RelatedProject.types"

function buildRelated(count: number): RelatedProject[] {
    return Array.from({ length: count }, (_value, index) => ({
        project: buildProjectSummary({
            id: `0192f1b2-3a4c-7d5e-8f60-718293a4b5c${index}`,
            title: `Relacionado ${index + 1}`
        })
    }))
}

function renderRelated(related: RelatedProject[]) {
    return render(
        <MemoryRouter>
            <RelatedProjects related={related} />
        </MemoryRouter>
    )
}

describe("RelatedProjects", () => {
    it("não renderiza nada nem mensagem sem relacionados", () => {
        const { container } = renderRelated([])

        expect(container).toBeEmptyDOMElement()
    })

    it.each([1, 2, 3])(
        "mostra h2 e uma lista com %i relacionado(s) na ordem do conteúdo",
        (count) => {
            renderRelated(buildRelated(count))
            const items = Array.from(screen.getAllByRole("list")[0].querySelectorAll(":scope > li"))

            expect(
                screen.getByRole("heading", { level: 2, name: "Projetos relacionados" })
            ).toBeInTheDocument()
            expect(items).toHaveLength(count)
            expect(items[0]).toHaveTextContent("Relacionado 1")
            expect(items[count - 1]).toHaveTextContent(`Relacionado ${count}`)
        }
    )

    it("mostra o título em h3 como único link do card, sem texto de motivo", () => {
        renderRelated(buildRelated(2))
        const link = screen.getByRole("link", { name: "Relacionado 1" })

        expect(link.closest("h3")).not.toBeNull()
        expect(link).toHaveAttribute("href", "/pt-BR/projects/0192f1b2-3a4c-7d5e-8f60-718293a4b5c0")
        expect(screen.queryByText(/Motivo/)).not.toBeInTheDocument()
        expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2)
    })

    it("não dá prioridade nem carga imediata às imagens", () => {
        const { container } = renderRelated(buildRelated(3))

        for (const image of Array.from(container.querySelectorAll("img"))) {
            expect(image).not.toHaveAttribute("fetchpriority")
            expect(image).toHaveAttribute("loading", "lazy")
        }
    })

    it("liga Ver todos a /projects sem query com o nome Ver todos os projetos e a seta aria-hidden", () => {
        renderRelated(buildRelated(1))
        const link = screen.getByRole("link", { name: "Ver todos os projetos" })

        expect(link).toHaveAttribute("href", "/pt-BR/projects")
        expect(link).toHaveTextContent("Ver todos")
        expect(link.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
    })

    it.each([
        ["en", "Related projects", "View all projects", "/en/projects"],
        ["es", "Proyectos relacionados", "Ver todos los proyectos", "/es/projects"]
    ] as const)("traduz textos e mantém o prefixo em %s", async (language, heading, name, href) => {
        renderRelated(buildRelated(1))
        await act(() => setLanguage(language))

        expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument()
        expect(screen.getByRole("link", { name })).toHaveAttribute("href", href)
        expect(screen.getByRole("link", { name: "Relacionado 1" })).toHaveAttribute(
            "href",
            expect.stringMatching(new RegExp(`^${href}/0192`))
        )
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderRelated(buildRelated(3))

        await expectNoAxeViolations(container)
    }, 15000)
})
