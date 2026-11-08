import { useState } from "react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TrajectoryItem from "@/components/TrajectoryItem"
import TrajectoryModal from "@/components/TrajectoryModal"
import setLanguage from "@/i18n/setLanguage"
import buildTimelineItem from "@/testUtils/buildTimelineItem"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type TimelineItem from "@/types/timeline/TimelineItem.types"

const ITEM = buildTimelineItem({
    title: "Desenvolvedor frontend",
    organization: "Empresa Exemplo",
    details: ["CLT"],
    start: "2024-06",
    end: "2026-05",
    summary: "Resumo da experiência.",
    responsibilities: ["Mantenho a interface"],
    technologies: ["React"]
})

let appRoot: HTMLDivElement

function Harness({ onClose = vi.fn() }: { onClose?: () => void }) {
    const [selected, setSelected] = useState<TimelineItem | null>(null)

    return (
        <MemoryRouter>
            <ul>
                <TrajectoryItem item={ITEM} onOpen={setSelected} />
            </ul>
            <TrajectoryModal
                item={selected}
                onClose={() => {
                    onClose()
                    setSelected(null)
                }}
            />
        </MemoryRouter>
    )
}

function renderHarness(onClose?: () => void) {
    return render(<Harness onClose={onClose} />, { container: appRoot })
}

beforeEach(() => {
    appRoot = document.createElement("div")
    appRoot.id = "root"
    document.body.appendChild(appRoot)
})

afterEach(() => {
    appRoot.remove()
})

describe("TrajectoryModal", () => {
    it("fechado não renderiza nada", () => {
        render(
            <MemoryRouter>
                <TrajectoryModal item={null} onClose={vi.fn()} />
            </MemoryRouter>
        )

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    })

    it("aberto é um diálogo modal nomeado pelo destaque do item", async () => {
        renderHarness()

        await userEvent.click(screen.getByRole("button", { name: /Desenvolvedor frontend/ }))
        const dialog = screen.getByRole("dialog", { name: "Desenvolvedor frontend" })

        expect(dialog).toHaveAttribute("aria-modal", "true")
        expect(
            within(dialog).getByRole("heading", { level: 2, name: "Desenvolvedor frontend" })
        ).toBeInTheDocument()
    })

    it("mostra no cabeçalho a linha de metadados com o período e o Fechar só de ícone", async () => {
        renderHarness()

        await userEvent.click(screen.getByRole("button", { name: /Desenvolvedor frontend/ }))
        const dialog = screen.getByRole("dialog")

        expect(dialog).toHaveTextContent("Empresa Exemplo · CLT · 06/2024 – 05/2026")
        expect(within(dialog).getByRole("button", { name: "Fechar" })).toHaveTextContent("")
        expect(dialog).toHaveAccessibleName("Desenvolvedor frontend")
    })

    it.each([
        ["en", "Close"],
        ["es", "Cerrar"]
    ] as const)("nomeia o Fechar em %s", async (language, name) => {
        await act(() => setLanguage(language))
        renderHarness()

        await userEvent.click(screen.getByRole("button", { name: /Desenvolvedor frontend/ }))

        expect(screen.getByRole("button", { name })).toBeInTheDocument()
    })

    it("renderiza o TrajectoryDetail do item e não duplica id com o contêiner oculto", async () => {
        renderHarness()

        await userEvent.click(screen.getByRole("button", { name: /Desenvolvedor frontend/ }))
        const dialog = screen.getByRole("dialog")
        const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id)

        expect(within(dialog).getByText("Resumo da experiência.")).toBeInTheDocument()
        expect(within(dialog).getByText("Mantenho a interface")).toBeInTheDocument()
        expect(new Set(ids).size).toBe(ids.length)
    })

    it("foca o título, prende o Tab, inertiza o #root e trava a rolagem", async () => {
        renderHarness()

        await userEvent.click(screen.getByRole("button", { name: /Desenvolvedor frontend/ }))
        const dialog = screen.getByRole("dialog")

        expect(screen.getByRole("heading", { name: "Desenvolvedor frontend" })).toHaveFocus()
        expect(appRoot).toHaveAttribute("inert")
        expect(document.body).toHaveAttribute("data-scroll-locked")

        await userEvent.tab()
        await userEvent.tab()
        await userEvent.tab()
        await userEvent.tab()

        expect(dialog.contains(document.activeElement)).toBe(true)

        await userEvent.tab({ shift: true })

        expect(dialog.contains(document.activeElement)).toBe(true)
    })

    it("fecha por Esc, fundo e Fechar, devolve o foco ao item e libera a rolagem", async () => {
        const onClose = vi.fn()
        renderHarness(onClose)
        const opener = screen.getByRole("button", { name: /Desenvolvedor frontend/ })

        await userEvent.click(opener)
        await userEvent.keyboard("{Escape}")

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        expect(opener).toHaveFocus()
        expect(document.body).not.toHaveAttribute("data-scroll-locked")
        expect(appRoot).not.toHaveAttribute("inert")

        await userEvent.click(opener)
        await userEvent.click(screen.getByRole("button", { name: "Fechar" }))

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()

        await userEvent.click(opener)
        const backdrop = screen.getByRole("dialog").parentElement as HTMLElement
        fireEvent.mouseDown(backdrop)
        fireEvent.click(backdrop)

        expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
        expect(onClose).toHaveBeenCalledTimes(3)
    })

    it("não tem violações de acessibilidade com o modal aberto", async () => {
        const { container } = renderHarness()

        await userEvent.click(screen.getByRole("button", { name: /Desenvolvedor frontend/ }))

        await expectNoAxeViolations(document.body)
        await expectNoAxeViolations(container)
    })
})
