import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import ProjectsExperiments from "@/components/ProjectsExperiments"
import buildProjectSummary from "@/testUtils/buildProjectSummary"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const projects = [
    buildProjectSummary({
        id: "0192f1b2-3a4c-7d5e-8f60-718293a4b601",
        title: "Experimento A",
        featured: false,
        experiment: true
    }),
    buildProjectSummary({
        id: "0192f1b2-3a4c-7d5e-8f60-718293a4b602",
        title: "Experimento B",
        featured: false,
        experiment: true
    })
]

function renderExperiments(firstIndex = 0, skeletonCount = 0) {
    return render(
        <MemoryRouter>
            <ProjectsExperiments
                projects={projects}
                firstIndex={firstIndex}
                skeletonCount={skeletonCount}
            />
        </MemoryRouter>
    )
}

describe("ProjectsExperiments", () => {
    it("mostra o título em h2 e a descrição da seção", () => {
        renderExperiments()

        expect(screen.getByRole("heading", { level: 2, name: "Experimentos" })).toBeInTheDocument()
        expect(
            screen.getByText("Projetos pequenos que fiz para praticar uma ideia.")
        ).toBeInTheDocument()
    })

    it("renderiza os cartões em h3", () => {
        renderExperiments()

        expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2)
        expect(screen.getByRole("heading", { level: 3, name: "Experimento A" })).toBeInTheDocument()
    })

    it("repassa firstIndex ao passo de revelação dos cartões", () => {
        renderExperiments(8)

        const steps = screen
            .getAllByRole("article")
            .map((article) => article.getAttribute("data-reveal-step"))

        expect(steps).toEqual(["5", "0"])
    })

    it("coloca os esqueletos do lote novo ao fim", () => {
        const { container } = renderExperiments(0, 3)

        expect(container.querySelectorAll("li[aria-hidden='true']")).toHaveLength(3)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderExperiments(0, 2)

        await expectNoAxeViolations(container)
    })
})
