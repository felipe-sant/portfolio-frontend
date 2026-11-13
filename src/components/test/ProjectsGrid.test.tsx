import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import ProjectsGrid from "@/components/ProjectsGrid"
import buildProjectSummary from "@/testUtils/buildProjectSummary"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type ProjectSummary from "@/types/project/ProjectSummary.types"

const IDS = [
    "0192f1b2-3a4c-7d5e-8f60-718293a4b501",
    "0192f1b2-3a4c-7d5e-8f60-718293a4b502",
    "0192f1b2-3a4c-7d5e-8f60-718293a4b503",
    "0192f1b2-3a4c-7d5e-8f60-718293a4b504",
    "0192f1b2-3a4c-7d5e-8f60-718293a4b505",
    "0192f1b2-3a4c-7d5e-8f60-718293a4b506",
    "0192f1b2-3a4c-7d5e-8f60-718293a4b507",
    "0192f1b2-3a4c-7d5e-8f60-718293a4b508",
    "0192f1b2-3a4c-7d5e-8f60-718293a4b509",
    "0192f1b2-3a4c-7d5e-8f60-718293a4b510",
    "0192f1b2-3a4c-7d5e-8f60-718293a4b511"
]

function buildProjects(count: number): ProjectSummary[] {
    return IDS.slice(0, count).map((id, index) =>
        buildProjectSummary({ id, title: `Projeto ${index + 1}`, featured: false })
    )
}

function renderGrid(props: Partial<Parameters<typeof ProjectsGrid>[0]> = {}) {
    return render(
        <MemoryRouter>
            <ProjectsGrid projects={[]} skeletonCount={0} {...props} />
        </MemoryRouter>
    )
}

function hiddenItems(container: HTMLElement) {
    return container.querySelectorAll("li[aria-hidden='true']")
}

describe("ProjectsGrid", () => {
    it("sem projetos renderiza só os esqueletos com aria-hidden", () => {
        const { container } = renderGrid({ skeletonCount: 9 })

        expect(screen.queryAllByRole("article")).toHaveLength(0)
        expect(container.querySelectorAll(":scope > ul > li")).toHaveLength(9)
        expect(hiddenItems(container)).toHaveLength(9)
    })

    it("renderiza um item de lista por projeto, na ordem recebida", () => {
        const { container } = renderGrid({ projects: buildProjects(3) })

        const items = Array.from(container.querySelectorAll(":scope > ul > li"))

        expect(items).toHaveLength(3)
        expect(items[0]).toHaveTextContent("Projeto 1")
        expect(items[2]).toHaveTextContent("Projeto 3")
    })

    it("repassa o nível de título ao cartão", () => {
        renderGrid({ projects: buildProjects(2), headingLevel: 3 })

        expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2)
        expect(screen.queryAllByRole("heading", { level: 2 })).toHaveLength(0)
    })

    it("usa nível 2 de título por padrão", () => {
        renderGrid({ projects: buildProjects(2) })

        expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(2)
    })

    it("recomeça o passo de revelação a cada nove cartões", () => {
        renderGrid({ projects: buildProjects(11) })

        const steps = screen
            .getAllByRole("article")
            .map((article) => article.getAttribute("data-reveal-step"))

        expect(steps).toEqual(["0", "1", "2", "3", "4", "5", "5", "5", "5", "0", "1"])
    })

    it("desloca o índice dos cartões por firstIndex", () => {
        renderGrid({ projects: buildProjects(2), firstIndex: 8 })

        const steps = screen
            .getAllByRole("article")
            .map((article) => article.getAttribute("data-reveal-step"))

        expect(steps).toEqual(["5", "0"])
    })

    it("trata só os três primeiros índices como imagens prioritárias", () => {
        const { container } = renderGrid({ projects: buildProjects(2), firstIndex: 2 })

        const images = container.querySelectorAll("img")

        expect(images[0]).not.toHaveAttribute("loading")
        expect(images[1]).toHaveAttribute("loading", "lazy")
    })

    it("coloca os esqueletos depois dos projetos", () => {
        const { container } = renderGrid({ projects: buildProjects(2), skeletonCount: 3 })

        const items = Array.from(container.querySelectorAll(":scope > ul > li"))

        expect(items).toHaveLength(5)
        expect(items.map((item) => item.getAttribute("aria-hidden"))).toEqual([
            null,
            null,
            "true",
            "true",
            "true"
        ])
    })

    it("sem esqueletos não renderiza itens ocultos", () => {
        const { container } = renderGrid({ projects: buildProjects(2), skeletonCount: 0 })

        expect(hiddenItems(container)).toHaveLength(0)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderGrid({ projects: buildProjects(3), skeletonCount: 2 })

        await expectNoAxeViolations(container)
    })
})
