import { describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import AboutStack from "@/components/AboutStack"
import buildProfile from "@/testUtils/buildProfile"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type AboutProfileState from "@/types/about/AboutProfileState.types"

const profileData = buildProfile()

function renderStack(state: Partial<AboutProfileState> = {}) {
    const profile: AboutProfileState = {
        data: profileData,
        isLoading: false,
        isError: false,
        retry: vi.fn(),
        ...state
    }

    return render(<AboutStack profile={profile} groups={profileData.stack} />)
}

describe("AboutStack", () => {
    it("mostra o título e os grupos da stack", () => {
        renderStack()

        expect(screen.getByRole("heading", { level: 2, name: "Stack" })).toBeInTheDocument()
        expect(screen.getByText("TypeScript")).toBeInTheDocument()
    })

    it("esconde os grupos enquanto carrega", () => {
        renderStack({ isLoading: true })

        expect(screen.getByRole("heading", { level: 2, name: "Stack" })).toBeInTheDocument()
        expect(screen.queryByText("TypeScript")).not.toBeInTheDocument()
    })

    it("mostra o erro sem anunciar", () => {
        renderStack({ isError: true })

        expect(
            screen.getByText("Não foi possível carregar esta parte da página.")
        ).toBeInTheDocument()
        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    })

    it.each([{}, { isLoading: true }, { isError: true }])(
        "não tem violações de acessibilidade com %o",
        async (state) => {
            const { container } = renderStack(state)

            await expectNoAxeViolations(container)
        }
    )
})
