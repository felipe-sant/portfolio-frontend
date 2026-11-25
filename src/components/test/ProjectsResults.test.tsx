import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import ProjectsResults from "@/components/ProjectsResults"
import buildProjectSummary from "@/testUtils/buildProjectSummary"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type ProjectSummary from "@/types/project/ProjectSummary.types"

function buildItems(count: number): ProjectSummary[] {
    return Array.from({ length: count }, (_value, index) =>
        buildProjectSummary({
            id: `0192f1b2-3a4c-7d5e-8f60-718293a4b1${index}`,
            title: `Projeto ${index + 1}`,
            featured: false
        })
    )
}

interface RenderOptions {
    isLoading?: boolean
    isError?: boolean
    items?: ProjectSummary[]
    skeletonCount?: number
    isNoResults?: boolean
    query?: string
}

function renderResults({
    isLoading = false,
    isError = false,
    items = buildItems(2),
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
                    items,
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
        const { container } = renderResults({ isLoading: true, items: [] })

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
        const { onClearFilters } = renderResults({ isNoResults: true, items: [] })

        expect(
            screen.getByRole("heading", { level: 2, name: "Nenhum projeto encontrado" })
        ).toBeInTheDocument()
        expect(screen.getByText("Nenhum projeto com essa combinação de filtros.")).toBeVisible()
        expect(screen.queryAllByRole("article")).toHaveLength(0)

        await user.click(screen.getByRole("button", { name: "Limpar filtros" }))

        expect(onClearFilters).toHaveBeenCalledTimes(1)
    })

    it("sem resultados com busca mostra o termo na mensagem", () => {
        renderResults({ isNoResults: true, items: [], query: "xyz" })

        expect(screen.getByText(/Nenhum resultado para “xyz”/)).toBeInTheDocument()
    })

    it("mostra todos os projetos numa única grade, na ordem recebida", () => {
        const { gridRef } = renderResults({ items: buildItems(4) })

        expect(gridRef.current?.querySelectorAll(":scope > ul")).toHaveLength(1)
        expect(
            screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)
        ).toEqual(["Projeto 1", "Projeto 2", "Projeto 3", "Projeto 4"])
    })

    it("coloca os esqueletos do próximo lote depois dos projetos, na mesma grade", () => {
        const { container, gridRef } = renderResults({ skeletonCount: 3 })

        expect(gridRef.current?.querySelectorAll(":scope > ul")).toHaveLength(1)
        expect(screen.getAllByRole("article")).toHaveLength(2)
        expect(container.querySelectorAll("li[aria-hidden='true']")).toHaveLength(3)
    })

    it("coloca gridRef no div que envolve a grade", () => {
        const { gridRef } = renderResults({ items: buildItems(3) })

        expect(gridRef.current).toBeInstanceOf(HTMLDivElement)
        expect(gridRef.current?.querySelectorAll("article")).toHaveLength(3)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderResults({ items: buildItems(4), skeletonCount: 2 })

        await expectNoAxeViolations(container)
    })
})
