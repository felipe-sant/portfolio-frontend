import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import AboutMeSection from "@/components/AboutMeSection"
import buildProfile from "@/testUtils/buildProfile"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type AboutProfileState from "@/types/about/AboutProfileState.types"

function renderSection(state: Partial<AboutProfileState> = {}) {
    const profile: AboutProfileState = {
        data: buildProfile({ aboutParagraphs: ["Primeiro parágrafo.", "Segundo parágrafo."] }),
        isLoading: false,
        isError: false,
        retry: vi.fn(),
        ...state
    }

    return render(<AboutMeSection profile={profile} />)
}

describe("AboutMeSection", () => {
    it("mostra o título e os parágrafos", () => {
        renderSection()

        expect(screen.getByRole("heading", { level: 2, name: "Sobre mim" })).toBeInTheDocument()
        expect(screen.getByText("Primeiro parágrafo.")).toBeInTheDocument()
        expect(screen.getByText("Segundo parágrafo.")).toBeInTheDocument()
    })

    it("mostra o título e esconde os parágrafos enquanto carrega", () => {
        renderSection({ data: undefined, isLoading: true })

        expect(screen.getByRole("heading", { level: 2, name: "Sobre mim" })).toBeInTheDocument()
        expect(screen.queryByText("Primeiro parágrafo.")).not.toBeInTheDocument()
    })

    it("mostra o erro sem anunciar e permite tentar de novo", () => {
        renderSection({ data: undefined, isError: true })

        expect(
            screen.getByText("Não foi possível carregar esta parte da página.")
        ).toBeInTheDocument()
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it.each([{}, { isLoading: true, data: undefined }, { isError: true, data: undefined }])(
        "não tem violações de acessibilidade com %o",
        async (state) => {
            const { container } = renderSection(state)

            await expectNoAxeViolations(container)
        }
    )
})
