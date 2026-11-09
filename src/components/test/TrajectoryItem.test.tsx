import { createRef } from "react"
import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import TrajectoryItem from "@/components/TrajectoryItem"
import setLanguage from "@/i18n/setLanguage"
import buildTimelineItem from "@/testUtils/buildTimelineItem"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type TimelineItem from "@/types/timeline/TimelineItem.types"

const EXPERIENCE = buildTimelineItem({
    title: "Desenvolvedor frontend",
    organization: "Empresa Exemplo",
    details: ["CLT"],
    start: "2024-06",
    end: "2026-05",
    summary: "Resumo oculto da experiência.",
    responsibilities: ["Mantenho a interface"]
})

function renderItem(item: TimelineItem = EXPERIENCE, onOpen = vi.fn()) {
    return render(
        <MemoryRouter>
            <ul>
                <TrajectoryItem item={item} onOpen={onOpen} />
            </ul>
        </MemoryRouter>
    )
}

describe("TrajectoryItem", () => {
    it("é um button com type button e aria-haspopup dialog dentro de um li", () => {
        renderItem()
        const button = screen.getByRole("button")

        expect(button).toHaveAttribute("type", "button")
        expect(button).toHaveAttribute("aria-haspopup", "dialog")
        expect(button.closest("li")).not.toBeNull()
    })

    it("chama onOpen com o item por clique, Enter e Espaço", async () => {
        const onOpen = vi.fn()
        renderItem(EXPERIENCE, onOpen)
        const button = screen.getByRole("button")

        await userEvent.click(button)
        button.focus()
        await userEvent.keyboard("{Enter}")
        await userEvent.keyboard(" ")

        expect(onOpen).toHaveBeenCalledTimes(3)
        expect(onOpen).toHaveBeenCalledWith(EXPERIENCE)
    })

    it("expõe o botão por ref", () => {
        const ref = createRef<HTMLButtonElement>()
        render(
            <MemoryRouter>
                <ul>
                    <TrajectoryItem item={EXPERIENCE} onOpen={vi.fn()} ref={ref} />
                </ul>
            </MemoryRouter>
        )

        expect(ref.current).toBe(screen.getByRole("button"))
    })

    it("mostra o cargo como destaque na experiência, com a linha de detalhes e o período", () => {
        const { container } = renderItem()
        const button = screen.getByRole("button")

        expect(button).toHaveTextContent("Desenvolvedor frontend")
        expect(button).toHaveTextContent("Empresa Exemplo · CLT")
        expect(button).toHaveTextContent("06/2024 – 05/2026")
        expect(container.querySelectorAll('button [aria-hidden="true"]')).toHaveLength(1)
    })

    it("destaca a instituição na formação e o título no curso", () => {
        const { unmount } = renderItem(
            buildTimelineItem({
                kind: "education",
                title: "Análise e Desenvolvimento de Sistemas",
                organization: "Fatec",
                stage: "6º semestre"
            })
        )

        expect(screen.getByRole("button").firstElementChild?.firstElementChild).toHaveTextContent(
            "Fatec"
        )
        expect(screen.getByRole("button")).toHaveTextContent(
            "Análise e Desenvolvimento de Sistemas · 6º semestre"
        )
        unmount()

        renderItem(
            buildTimelineItem({ kind: "course", title: "React avançado", organization: "Alura" })
        )

        expect(screen.getByRole("button").firstElementChild?.firstElementChild).toHaveTextContent(
            "React avançado"
        )
    })

    it("mostra o selo Atual só sem end", () => {
        const { unmount } = renderItem(buildTimelineItem({ end: undefined }))

        expect(screen.getByRole("button")).toHaveTextContent("Atual")
        unmount()

        renderItem()

        expect(screen.getByRole("button")).not.toHaveTextContent("Atual")
    })

    it("guarda o corpo do detalhe num contêiner hidden fora da árvore de acessibilidade", () => {
        const { container } = renderItem()
        const hidden = container.querySelector("li > [hidden]")

        expect(hidden).toHaveTextContent("Resumo oculto da experiência.")
        expect(screen.getAllByRole("button")).toHaveLength(1)
        expect(screen.queryByText("Resumo oculto da experiência.")).not.toBeVisible()
    })

    it.each([
        ["en", "Current", "since 06/2026"],
        ["es", "Actual", "desde 06/2026"]
    ] as const)(
        "mostra o período em curso em %s sem chave no lugar do texto",
        async (language, badge, since) => {
            await act(() => setLanguage(language))
            renderItem(buildTimelineItem({ end: undefined, start: "2026-06" }))
            const button = screen.getByRole("button")

            expect(button).toHaveTextContent(badge)
            expect(button).toHaveTextContent(since)
        }
    )

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderItem()

        await expectNoAxeViolations(container)
    })
})
