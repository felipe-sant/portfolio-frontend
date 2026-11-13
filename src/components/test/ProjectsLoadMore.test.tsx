import { describe, expect, it, vi } from "vitest"
import userEvent from "@testing-library/user-event"
import { render, screen } from "@testing-library/react"
import ProjectsLoadMore from "@/components/ProjectsLoadMore"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

interface RenderOptions {
    hasMore?: boolean
    isFetchingMore?: boolean
    loadMoreError?: boolean
    isListError?: boolean
}

function renderLoadMore({
    hasMore = true,
    isFetchingMore = false,
    loadMoreError = false,
    isListError = false
}: RenderOptions = {}) {
    const loadMore = vi.fn()
    const retryLoadMore = vi.fn()

    const view = render(
        <ProjectsLoadMore
            more={{ hasMore, isFetchingMore, loadMoreError, loadMore, retryLoadMore }}
            alertId="projects-load-more-alert"
            isListError={isListError}
        />
    )

    return { ...view, loadMore, retryLoadMore }
}

describe("ProjectsLoadMore", () => {
    it("com loadMoreError mostra o alerta com o id recebido e Tentar novamente chama retryLoadMore", async () => {
        const user = userEvent.setup()
        const { retryLoadMore } = renderLoadMore({ loadMoreError: true })

        const alert = screen.getByRole("alert")

        expect(alert).toHaveAttribute("id", "projects-load-more-alert")
        expect(alert).toHaveTextContent("Não consegui carregar mais projetos")

        await user.click(screen.getByRole("button", { name: "Tentar novamente" }))

        expect(retryLoadMore).toHaveBeenCalledTimes(1)
    })

    it("sem loadMoreError não mostra o alerta", () => {
        renderLoadMore()

        expect(screen.queryByRole("alert")).toBeNull()
    })

    it("com hasMore mostra o botão Carregar mais e o clique chama loadMore", async () => {
        const user = userEvent.setup()
        const { loadMore } = renderLoadMore()

        await user.click(screen.getByRole("button", { name: "Carregar mais" }))

        expect(loadMore).toHaveBeenCalledTimes(1)
    })

    it("sem hasMore não mostra o botão", () => {
        renderLoadMore({ hasMore: false })

        expect(screen.queryByRole("button", { name: "Carregar mais" })).toBeNull()
    })

    it("com isListError esconde o botão mesmo com hasMore", () => {
        renderLoadMore({ isListError: true })

        expect(screen.queryByRole("button", { name: "Carregar mais" })).toBeNull()
    })

    it("com isFetchingMore o botão fica ocupado sem desabilitar e o clique é ignorado", async () => {
        const user = userEvent.setup()
        const { loadMore } = renderLoadMore({ isFetchingMore: true })

        const button = screen.getByRole("button", { name: "Carregar mais" })

        expect(button).toHaveAttribute("aria-busy", "true")
        expect(button).not.toBeDisabled()

        await user.click(button)

        expect(loadMore).not.toHaveBeenCalled()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderLoadMore({ loadMoreError: true, isFetchingMore: true })

        await expectNoAxeViolations(container)
    })
})
