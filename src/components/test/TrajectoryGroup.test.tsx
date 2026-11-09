import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TrajectoryGroup from "@/components/TrajectoryGroup"
import setLanguage from "@/i18n/setLanguage"
import buildTimelineItem from "@/testUtils/buildTimelineItem"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type TimelineGroup from "@/types/timeline/TimelineGroup.types"

const FIRST = buildTimelineItem({
    id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c1",
    title: "Primeiro cargo"
})
const SECOND = buildTimelineItem({
    id: "0192f1b2-3a4c-7d5e-8f60-718293a4b5c2",
    title: "Segundo cargo"
})

function renderGroup(group: TimelineGroup, onOpen = vi.fn()) {
    return render(
        <MemoryRouter>
            <TrajectoryGroup group={group} onOpen={onOpen} />
        </MemoryRouter>
    )
}

describe("TrajectoryGroup", () => {
    it.each([
        ["experience", "Experiências profissionais"],
        ["education", "Formações"],
        ["course", "Cursos"]
    ] as const)("mostra o h3 do grupo %s", (kind, label) => {
        renderGroup({ kind, items: [buildTimelineItem({ kind })] })

        expect(screen.getByRole("heading", { level: 3, name: label })).toBeInTheDocument()
    })

    it.each([
        ["en", "Professional experience", "2 items"],
        ["es", "Experiencia profesional", "2 elementos"]
    ] as const)("traduz o título e a contagem em %s", async (language, label, count) => {
        await act(() => setLanguage(language))
        renderGroup({ kind: "experience", items: [FIRST, SECOND] })

        expect(screen.getByRole("heading", { level: 3, name: label })).toBeInTheDocument()
        expect(screen.getByText(count)).toBeInTheDocument()
    })

    it("mostra a contagem em plural e a lista com os itens na ordem recebida", () => {
        renderGroup({ kind: "experience", items: [FIRST, SECOND] })
        const list = screen.getAllByRole("list")[0]

        expect(screen.getByText("2 itens")).toBeInTheDocument()
        expect(
            within(list)
                .getAllByRole("button")
                .map((button) => button.textContent)
        ).toEqual([
            expect.stringContaining("Primeiro cargo"),
            expect.stringContaining("Segundo cargo")
        ])
    })

    it("sem item não renderiza nada, nem o h3", () => {
        const { container } = renderGroup({ kind: "course", items: [] })

        expect(container).toBeEmptyDOMElement()
    })

    it("chama onOpen com o item clicado", async () => {
        const onOpen = vi.fn()
        renderGroup({ kind: "experience", items: [FIRST, SECOND] }, onOpen)

        await userEvent.click(screen.getByRole("button", { name: /Segundo cargo/ }))

        expect(onOpen).toHaveBeenCalledWith(SECOND)
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderGroup({ kind: "experience", items: [FIRST, SECOND] })

        await expectNoAxeViolations(container)
    })
})
