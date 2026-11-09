import { describe, expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import TrajectoryPeriod from "@/components/TrajectoryPeriod"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("TrajectoryPeriod", () => {
    it("mostra o período encerrado com duas datas em time", () => {
        const { container } = render(<TrajectoryPeriod start="2024-06" end="2026-05" />)
        const times = container.querySelectorAll("time")

        expect(container).toHaveTextContent("06/2024 – 05/2026")
        expect(times).toHaveLength(2)
        expect(times[0]).toHaveAttribute("datetime", "2024-06")
        expect(times[1]).toHaveAttribute("datetime", "2026-05")
        expect(screen.queryByText("Atual")).not.toBeInTheDocument()
    })

    it.each([
        ["pt-BR", "desde 06/2026", "Atual"],
        ["en", "since 06/2026", "Current"],
        ["es", "desde 06/2026", "Actual"]
    ] as const)(
        "em curso mostra a data em um time e o selo à parte em %s",
        async (language, text, badge) => {
            await act(() => setLanguage(language))
            const { container } = render(<TrajectoryPeriod start="2026-06" />)
            const times = container.querySelectorAll("time")

            expect(times).toHaveLength(1)
            expect(times[0]).toHaveAttribute("datetime", "2026-06")
            expect(times[0].parentElement).toHaveTextContent(text)
            expect(screen.getByText(badge)).toBeInTheDocument()
            expect(times[0].parentElement).not.toHaveTextContent(badge)
        }
    )

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<TrajectoryPeriod start="2026-06" />)

        await expectNoAxeViolations(container)
    })
})
