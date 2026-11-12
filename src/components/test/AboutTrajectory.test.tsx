import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import AboutTrajectory from "@/components/AboutTrajectory"
import buildTimeline from "@/testUtils/buildTimeline"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type AboutTimelineState from "@/types/about/AboutTimelineState.types"

const timelineData = buildTimeline()

function renderTrajectory(state: Partial<AboutTimelineState> = {}) {
    const timeline: AboutTimelineState = {
        groups: timelineData.groups,
        certificates: timelineData.certificates,
        isLoading: false,
        isError: false,
        retry: vi.fn(),
        ...state
    }

    return render(
        <MemoryRouter>
            <AboutTrajectory
                timeline={timeline}
                headingId="trajectory-heading"
                alertId="trajectory-alert"
                onOpen={vi.fn()}
                registerTrigger={() => null}
            />
        </MemoryRouter>
    )
}

describe("AboutTrajectory", () => {
    it("mostra o título focável, a dica e os itens", () => {
        renderTrajectory()

        expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute("tabindex", "-1")
        expect(screen.getByRole("heading", { level: 2 })).toHaveAttribute(
            "id",
            "trajectory-heading"
        )
        expect(screen.getByText("Desenvolvedor frontend")).toBeInTheDocument()
    })

    it("esconde os itens enquanto carrega", () => {
        renderTrajectory({ groups: [], isLoading: true })

        expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument()
        expect(screen.queryByText("Desenvolvedor frontend")).not.toBeInTheDocument()
    })

    it("anuncia o erro com o id de foco", () => {
        renderTrajectory({ groups: [], isError: true })

        expect(screen.getByRole("alert")).toHaveAttribute("id", "trajectory-alert")
    })

    it.each([{}, { groups: [], isLoading: true }, { groups: [], isError: true }])(
        "não tem violações de acessibilidade com %o",
        async (state) => {
            const { container } = renderTrajectory(state)

            await expectNoAxeViolations(container)
        }
    )
})
