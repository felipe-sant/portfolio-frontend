import { describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { fireEvent, render, screen } from "@testing-library/react"
import ProjectsToolbar from "@/components/ProjectsToolbar"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

interface RenderOptions {
    draft?: string
    filtersCount?: number
    isFiltersOpen?: boolean
}

function renderToolbar({
    draft = "",
    filtersCount = 0,
    isFiltersOpen = false
}: RenderOptions = {}) {
    const setDraft = vi.fn()
    const clearSearch = vi.fn()
    const onOpenFilters = vi.fn()

    const view = render(
        <ProjectsToolbar
            searchId="projects-search"
            search={{ draft, setDraft, clearSearch }}
            filtersCount={filtersCount}
            isFiltersOpen={isFiltersOpen}
            onOpenFilters={onOpenFilters}
        />
    )

    return { ...view, setDraft, clearSearch, onOpenFilters }
}

describe("ProjectsToolbar", () => {
    it("o campo de busca tem rótulo, placeholder, id e limite de 100 caracteres", () => {
        renderToolbar()

        const input = screen.getByRole("searchbox", { name: "Buscar projeto" })

        expect(input).toHaveAttribute("placeholder", "Busque por nome ou tecnologia")
        expect(input).toHaveAttribute("maxlength", "100")
        expect(input).toHaveAttribute("id", "projects-search")
    })

    it("digitar chama setDraft com o texto", () => {
        const { setDraft } = renderToolbar()

        fireEvent.change(screen.getByRole("searchbox"), { target: { value: "api" } })

        expect(setDraft).toHaveBeenCalledWith("api")
    })

    it("limpar a busca chama clearSearch", async () => {
        const user = userEvent.setup()
        const { clearSearch } = renderToolbar({ draft: "api" })

        await user.click(screen.getByRole("button", { name: "Limpar busca" }))

        expect(clearSearch).toHaveBeenCalledTimes(1)
    })

    it("o botão Filtros tem aria-haspopup dialog, aria-expanded falso e não é aria-disabled", () => {
        renderToolbar()

        const button = screen.getByRole("button", { name: "Filtros" })

        expect(button).toHaveAttribute("aria-haspopup", "dialog")
        expect(button).toHaveAttribute("aria-expanded", "false")
        expect(button).not.toHaveAttribute("aria-disabled")
    })

    it("aria-expanded acompanha isFiltersOpen", () => {
        renderToolbar({ isFiltersOpen: true })

        expect(screen.getByRole("button", { name: "Filtros" })).toHaveAttribute(
            "aria-expanded",
            "true"
        )
    })

    it("mostra o contador no botão só quando filtersCount é maior que zero", () => {
        const { unmount } = renderToolbar({ filtersCount: 0 })

        expect(screen.getByRole("button", { name: "Filtros" })).toBeInTheDocument()

        unmount()
        renderToolbar({ filtersCount: 2 })

        expect(screen.getByRole("button", { name: "Filtros (2)" })).toBeInTheDocument()
    })

    it("clicar em Filtros chama onOpenFilters", async () => {
        const user = userEvent.setup()
        const { onOpenFilters } = renderToolbar()

        await user.click(screen.getByRole("button", { name: "Filtros" }))

        expect(onOpenFilters).toHaveBeenCalledTimes(1)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderToolbar({ draft: "api", filtersCount: 1 })

        await expectNoAxeViolations(container)
    })
})
