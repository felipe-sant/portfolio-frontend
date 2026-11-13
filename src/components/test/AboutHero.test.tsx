import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import AboutHero from "@/components/AboutHero"
import buildProfile from "@/testUtils/buildProfile"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import type AboutProfileState from "@/types/about/AboutProfileState.types"

function renderHero(state: Partial<AboutProfileState> = {}) {
    const profile: AboutProfileState = {
        data: buildProfile({ summary: "Resumo do perfil." }),
        isLoading: false,
        isError: false,
        retry: vi.fn(),
        ...state
    }

    return render(
        <MemoryRouter>
            <AboutHero
                profile={profile}
                headingId="hero-heading"
                alertId="hero-alert"
                updatedLabel="07/2026"
                contactPath="/pt-BR/contact"
                resumeHref="/resume.pdf"
                onOpenResume={vi.fn()}
            />
        </MemoryRouter>
    )
}

describe("AboutHero", () => {
    it("mostra o título, o resumo, a localização e a disponibilidade", () => {
        renderHero()

        expect(screen.getByRole("heading", { level: 1 })).toHaveAttribute("id", "hero-heading")
        expect(screen.getByText("Resumo do perfil.")).toBeInTheDocument()
        expect(screen.getByText(/São José dos Campos/)).toBeInTheDocument()
        expect(screen.getByText("Disponível para projetos")).toBeInTheDocument()
        expect(screen.getByText(/Atualizado em 07\/2026/)).toBeInTheDocument()
    })

    it("esconde o resumo e a localização enquanto carrega", () => {
        renderHero({ data: undefined, isLoading: true })

        expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument()
        expect(screen.queryByText("Resumo do perfil.")).not.toBeInTheDocument()
        expect(screen.queryByText(/São José dos Campos/)).not.toBeInTheDocument()
    })

    it("anuncia só o erro dos fatos e deixa o do resumo sem alerta", () => {
        renderHero({ data: undefined, isError: true })

        expect(screen.getAllByText("Não foi possível carregar esta parte da página.")).toHaveLength(
            2
        )
        expect(screen.getAllByRole("alert")).toHaveLength(1)
        expect(screen.getByRole("alert")).toHaveAttribute("id", "hero-alert")
    })

    it("tem os botões de currículo e contato", () => {
        renderHero()

        expect(
            screen.getByRole("link", { name: "Baixar CV (PDF), abre a pré-visualização" })
        ).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Entrar em contato" })).toHaveAttribute(
            "href",
            "/pt-BR/contact"
        )
    })

    it.each([{}, { isLoading: true, data: undefined }, { isError: true, data: undefined }])(
        "não tem violações de acessibilidade com %o",
        async (state) => {
            const { container } = renderHero(state)

            await expectNoAxeViolations(container)
        }
    )
})
