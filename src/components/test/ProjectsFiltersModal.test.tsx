import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ProjectsFiltersModal from "@/components/ProjectsFiltersModal"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

let appRoot: HTMLDivElement

type Applied = { tech: string[]; year: string[] }

type ModalHarnessProps = {
    isOpen?: boolean
    technologies?: string[]
    years?: string[]
    applied?: Applied
    onApply?: (next: Applied) => void
    onClose?: () => void
}

function ModalHarness({
    isOpen = true,
    technologies = ["Node.js", "React", "TypeScript"],
    years = ["2026", "2025", "2024"],
    applied = { tech: [], year: [] },
    onApply = vi.fn(),
    onClose = vi.fn()
}: ModalHarnessProps) {
    return (
        <ProjectsFiltersModal
            isOpen={isOpen}
            technologies={technologies}
            years={years}
            applied={applied}
            onApply={onApply}
            onClose={onClose}
        />
    )
}

function renderModal(props: ModalHarnessProps = {}) {
    return render(<ModalHarness {...props} />, { container: appRoot })
}

beforeEach(() => {
    appRoot = document.createElement("div")
    appRoot.id = "root"
    document.body.appendChild(appRoot)
})

afterEach(() => {
    appRoot.remove()
})

describe("ProjectsFiltersModal", () => {
    it("sem tecnologia nem ano abre só com título, resumo e rodapé, sem fieldset", () => {
        renderModal({ technologies: [], years: [] })

        expect(screen.getByRole("dialog", { name: "Filtros" })).toBeVisible()
        expect(screen.getByText("Nenhum filtro selecionado")).toBeVisible()
        expect(screen.getByRole("button", { name: "Limpar" })).toBeVisible()
        expect(screen.getByRole("button", { name: "Aplicar" })).toBeVisible()
        expect(screen.queryByRole("group")).not.toBeInTheDocument()
    })

    it("mostra Tecnologia e Ano em fieldset com legend e uma caixa por opção, marcando as aplicadas", () => {
        renderModal({ applied: { tech: ["React"], year: ["2025"] } })

        const technology = screen.getByRole("group", { name: "Tecnologia" })
        const year = screen.getByRole("group", { name: "Ano" })

        expect(
            within(technology)
                .getAllByRole("checkbox")
                .map((box) => box.closest("label")?.textContent)
        ).toEqual(["Node.js", "React", "TypeScript"])
        expect(
            within(year)
                .getAllByRole("checkbox")
                .map((box) => box.closest("label")?.textContent)
        ).toEqual(["2026", "2025", "2024"])
        expect(within(technology).getByRole("checkbox", { name: "React" })).toBeChecked()
        expect(within(technology).getByRole("checkbox", { name: "Node.js" })).not.toBeChecked()
        expect(within(year).getByRole("checkbox", { name: "2025" })).toBeChecked()
    })

    it("omite a seção que não tem opção", () => {
        renderModal({ years: [] })

        expect(screen.getByRole("group", { name: "Tecnologia" })).toBeVisible()
        expect(screen.queryByRole("group", { name: "Ano" })).not.toBeInTheDocument()
    })

    it("marcar e desmarcar altera o resumo sem chamar onApply", async () => {
        const user = userEvent.setup()
        const onApply = vi.fn()
        renderModal({ onApply })

        await user.click(screen.getByRole("checkbox", { name: "React" }))
        expect(screen.getByText("1 filtro selecionado")).toBeVisible()

        await user.click(screen.getByRole("checkbox", { name: "2025" }))
        expect(screen.getByText("2 filtros selecionados")).toBeVisible()

        await user.click(screen.getByRole("checkbox", { name: "React" }))
        await user.click(screen.getByRole("checkbox", { name: "2025" }))
        expect(screen.getByText("Nenhum filtro selecionado")).toBeVisible()
        expect(onApply).not.toHaveBeenCalled()
    })

    it("descreve o diálogo pelo resumo", () => {
        renderModal({ applied: { tech: ["React"], year: [] } })

        expect(screen.getByRole("dialog")).toHaveAccessibleDescription("1 filtro selecionado")
    })

    it.each([
        [
            "Aplicar",
            async (user: ReturnType<typeof userEvent.setup>) =>
                user.click(screen.getByRole("button", { name: "Aplicar" }))
        ],
        [
            "Fechar",
            async (user: ReturnType<typeof userEvent.setup>) =>
                user.click(screen.getByRole("button", { name: "Fechar" }))
        ],
        ["Esc", async (user: ReturnType<typeof userEvent.setup>) => user.keyboard("{Escape}")],
        [
            "o fundo",
            async (user: ReturnType<typeof userEvent.setup>) =>
                user.click(screen.getByRole("dialog").parentElement as HTMLElement)
        ]
    ])("fechar por %s aplica o rascunho e fecha", async (_name, close) => {
        const user = userEvent.setup()
        const onApply = vi.fn()
        const onClose = vi.fn()
        renderModal({ onApply, onClose })

        await user.click(screen.getByRole("checkbox", { name: "React" }))
        await user.click(screen.getByRole("checkbox", { name: "Node.js" }))
        await user.click(screen.getByRole("checkbox", { name: "2024" }))
        await close(user)

        expect(onApply).toHaveBeenCalledTimes(1)
        expect(onApply).toHaveBeenCalledWith({ tech: ["React", "Node.js"], year: ["2024"] })
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it.each([
        ["Aplicar", () => userEvent.click(screen.getByRole("button", { name: "Aplicar" }))],
        ["Fechar", () => userEvent.click(screen.getByRole("button", { name: "Fechar" }))],
        ["Esc", () => userEvent.keyboard("{Escape}")],
        ["o fundo", () => userEvent.click(screen.getByRole("dialog").parentElement as HTMLElement)]
    ])("fechar por %s com o rascunho igual ao aplicado não chama onApply", async (_name, close) => {
        const onApply = vi.fn()
        const onClose = vi.fn()
        renderModal({
            onApply,
            onClose,
            applied: { tech: ["React", "Node.js"], year: ["2025"] }
        })

        await userEvent.click(screen.getByRole("checkbox", { name: "TypeScript" }))
        await userEvent.click(screen.getByRole("checkbox", { name: "TypeScript" }))
        await close()

        expect(onApply).not.toHaveBeenCalled()
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it("compara o rascunho com o aplicado sem considerar a ordem", async () => {
        const onApply = vi.fn()
        renderModal({ onApply, applied: { tech: ["React", "Node.js"], year: [] } })

        await userEvent.click(screen.getByRole("checkbox", { name: "React" }))
        await userEvent.click(screen.getByRole("checkbox", { name: "React" }))
        await userEvent.click(screen.getByRole("button", { name: "Aplicar" }))

        expect(onApply).not.toHaveBeenCalled()
    })

    it("Limpar desmarca tudo, mantém o modal aberto e só aplica ao fechar", async () => {
        const onApply = vi.fn()
        const onClose = vi.fn()
        renderModal({ onApply, onClose, applied: { tech: ["React"], year: ["2025"] } })

        await userEvent.click(screen.getByRole("button", { name: "Limpar" }))

        expect(
            screen
                .getAllByRole("checkbox")
                .filter((box) => box instanceof HTMLInputElement && box.checked)
        ).toHaveLength(0)
        expect(screen.getByText("Nenhum filtro selecionado")).toBeVisible()
        expect(screen.getByRole("dialog")).toBeVisible()
        expect(onApply).not.toHaveBeenCalled()
        expect(onClose).not.toHaveBeenCalled()

        await userEvent.click(screen.getByRole("button", { name: "Aplicar" }))

        expect(onApply).toHaveBeenCalledWith({ tech: [], year: [] })
    })

    it("reabrir descarta o rascunho que não foi aplicado", async () => {
        const { rerender } = renderModal({ applied: { tech: ["React"], year: [] } })

        await userEvent.click(screen.getByRole("checkbox", { name: "Node.js" }))
        expect(screen.getByText("2 filtros selecionados")).toBeVisible()

        rerender(<ModalHarness isOpen={false} applied={{ tech: ["React"], year: [] }} />)
        rerender(<ModalHarness isOpen applied={{ tech: ["React"], year: [] }} />)

        expect(screen.getByText("1 filtro selecionado")).toBeVisible()
        expect(screen.getByRole("checkbox", { name: "Node.js" })).not.toBeChecked()
    })

    it("não marca como selecionada a tecnologia aplicada que não existe nas opções", () => {
        renderModal({ applied: { tech: ["Inexistente"], year: [] } })

        expect(
            screen
                .getAllByRole("checkbox")
                .filter((box) => box instanceof HTMLInputElement && box.checked)
        ).toHaveLength(0)
    })

    it.each([
        [
            "pt-BR",
            [
                "Filtros",
                "Nenhum filtro selecionado",
                "Tecnologia",
                "Ano",
                "Fechar",
                "Limpar",
                "Aplicar"
            ]
        ],
        ["en", ["Filters", "No filters selected", "Technology", "Year", "Close", "Clear", "Apply"]],
        [
            "es",
            [
                "Filtros",
                "Ningún filtro seleccionado",
                "Tecnología",
                "Año",
                "Cerrar",
                "Limpiar",
                "Aplicar"
            ]
        ]
    ] as const)("mostra os textos em %s sem chave no lugar do texto", async (language, texts) => {
        await setLanguage(language)

        renderModal()

        const [title, summary, technology, year, close, clear, apply] = texts

        expect(screen.getByRole("heading", { name: title })).toBeVisible()
        expect(screen.getByText(summary)).toBeVisible()
        expect(screen.getByRole("group", { name: technology })).toBeVisible()
        expect(screen.getByRole("group", { name: year })).toBeVisible()
        expect(screen.getByRole("button", { name: close })).toBeVisible()
        expect(screen.getByRole("button", { name: clear })).toBeVisible()
        expect(screen.getByRole("button", { name: apply })).toBeVisible()
        expect(document.body.textContent).not.toMatch(/\bfilters\.[a-zA-Z]+/)
    })

    it.each([
        ["en", "2 filters selected"],
        ["es", "2 filtros seleccionados"]
    ] as const)("pluraliza o resumo em %s", async (language, summary) => {
        await setLanguage(language)

        renderModal({ applied: { tech: ["React"], year: ["2025"] } })

        expect(screen.getByText(summary)).toBeVisible()
    })

    it("não tem violações de acessibilidade aberto sem opções marcadas", async () => {
        renderModal()

        await expectNoAxeViolations(document.body)
    }, 15000)

    it("não tem violações de acessibilidade aberto com opções marcadas", async () => {
        renderModal({ applied: { tech: ["React"], year: ["2025"] } })

        await expectNoAxeViolations(document.body)
    }, 15000)
})
