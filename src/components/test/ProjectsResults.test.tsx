import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import ProjectsResults from "@/components/ProjectsResults"
import buildProjectSummary from "@/testUtils/buildProjectSummary"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type ProjectSummary from "@/types/project/ProjectSummary.types"

function buildItems(prefix: string, count: number, experiment: boolean): ProjectSummary[] {
    return Array.from({ length: count }, (_value, index) =>
        buildProjectSummary({
            id: `0192f1b2-3a4c-7d5e-8f60-718293a4b${prefix}${index}`,
            title: `${experiment ? "Experimento" : "Principal"} ${index + 1}`,
            featured: false,
            experiment
        })
    )
}

interface RenderOptions {
    isLoading?: boolean
    isError?: boolean
    mainItems?: ProjectSummary[]
    experimentItems?: ProjectSummary[]
    skeletonCount?: number
    isNoResults?: boolean
    query?: string
}

function renderResults({
    isLoading = false,
    isError = false,
    mainItems = buildItems("1", 2, false),
    experimentItems = [],
    skeletonCount = 0,
    isNoResults = false,
    query = ""
}: RenderOptions = {}) {
    const retry = vi.fn()
    const onClearFilters = vi.fn()
    const gridRef = createRef<HTMLDivElement>()

    const view = render(
        <MemoryRouter>
            <ProjectsResults
                list={{
                    isLoading,
                    isError,
                    retry,
                    mainItems,
                    experimentItems,
                    skeletonCount,
                    gridRef
                }}
                isNoResults={isNoResults}
                query={query}
                onClearFilters={onClearFilters}
            />
        </MemoryRouter>
    )

    return { ...view, retry, onClearFilters, gridRef }
}

describe("ProjectsResults", () => {
    it("ao carregar mostra nove esqueletos ocultos e nenhuma grade de projetos", () => {
        const { container } = renderResults({ isLoading: true, mainItems: [] })

        expect(container.querySelectorAll("li[aria-hidden='true']")).toHaveLength(9)
        expect(screen.queryAllByRole("article")).toHaveLength(0)
    })

    it("no erro mostra o alerta, chama retry e esconde grade e estado vazio", async () => {
        const user = userEvent.setup()
        const { retry } = renderResults({ isError: true, isNoResults: true })

        expect(screen.getByRole("alert")).toHaveTextContent(
            "Não consegui carregar a lista de projetos"
        )
        expect(screen.queryAllByRole("article")).toHaveLength(0)
        expect(screen.queryByRole("heading", { name: "Nenhum projeto encontrado" })).toBeNull()

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }))

        expect(retry).toHaveBeenCalledTimes(1)
    })

    it("sem resultados e sem busca mostra o texto dos filtros e o botão que limpa", async () => {
        const user = userEvent.setup()
        const { onClearFilters } = renderResults({ isNoResults: true, mainItems: [] })

        expect(
            screen.getByRole("heading", { level: 2, name: "Nenhum projeto encontrado" })
        ).toBeInTheDocument()
        expect(screen.getByText("Nenhum projeto com essa combinação de filtros.")).toBeVisible()
        expect(screen.queryAllByRole("article")).toHaveLength(0)

        await user.click(screen.getByRole("button", { name: "Limpar filtros" }))

        expect(onClearFilters).toHaveBeenCalledTimes(1)
    })

    it("sem resultados com busca mostra o termo na mensagem", () => {
        renderResults({ isNoResults: true, mainItems: [], query: "xyz" })

        expect(screen.getByText(/Nenhum resultado para “xyz”/)).toBeInTheDocument()
    })

    it("só com principais mostra a grade e não mostra a seção Experimentos", () => {
        renderResults()

        expect(screen.getAllByRole("article")).toHaveLength(2)
        expect(screen.queryByRole("heading", { name: "Experimentos" })).toBeNull()
    })

    it("só com experimentos mostra a seção sem grade principal", () => {
        const { container } = renderResults({
            mainItems: [],
            experimentItems: buildItems("2", 2, true)
        })

        expect(screen.getByRole("heading", { level: 2, name: "Experimentos" })).toBeInTheDocument()
        expect(container.querySelectorAll(":scope > div > ul")).toHaveLength(0)
        expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2)
    })

    it("com os dois mostra a grade principal e depois a seção Experimentos", () => {
        renderResults({ experimentItems: buildItems("2", 2, true) })

        const main = screen.getByRole("heading", { name: "Principal 1" })
        const experiments = screen.getByRole("heading", { name: "Experimentos" })

        expect(main.compareDocumentPosition(experiments)).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
        expect(screen.getAllByRole("article")).toHaveLength(4)
    })

    it("coloca gridRef no div que envolve as grades", () => {
        const { gridRef } = renderResults({ experimentItems: buildItems("2", 1, true) })

        expect(gridRef.current).toBeInstanceOf(HTMLDivElement)
        expect(gridRef.current?.querySelectorAll("article")).toHaveLength(3)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderResults({
            experimentItems: buildItems("2", 2, true),
            skeletonCount: 2
        })

        await expectNoAxeViolations(container)
    })
})
