import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, render, screen } from "@testing-library/react"
import MarkdownDocument from "@/components/MarkdownDocument"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const TASKS = "- [x] primeira\n- [ ] segunda"

function renderMarkdown(content: string) {
    return render(
        <MemoryRouter>
            <MarkdownDocument content={content} />
        </MemoryRouter>
    )
}

describe("MarkdownTaskCheckbox", () => {
    it("renderiza a caixa desabilitada com o nome Feito quando marcada e A fazer quando não", () => {
        renderMarkdown(TASKS)
        const done = screen.getByRole("checkbox", { name: "Feito" })
        const todo = screen.getByRole("checkbox", { name: "A fazer" })

        expect(done).toBeChecked()
        expect(done).toBeDisabled()
        expect(todo).not.toBeChecked()
        expect(todo).toBeDisabled()
    })

    it.each([
        ["en", "Done", "To do"],
        ["es", "Hecho", "Pendiente"]
    ] as const)("traduz os nomes em %s", async (language, done, todo) => {
        renderMarkdown(TASKS)
        await act(() => setLanguage(language))

        expect(screen.getByRole("checkbox", { name: done })).toBeInTheDocument()
        expect(screen.getByRole("checkbox", { name: todo })).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderMarkdown(TASKS)

        await expectNoAxeViolations(container)
    }, 15000)
})
