import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import AboutNowCard from "@/components/AboutNowCard"
import buildProfile from "@/testUtils/buildProfile"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const profile = buildProfile({
    role: "Estagiário de Desenvolvimento Frontend",
    location: { city: "São José dos Campos", region: "SP", countryCode: "BR", detail: "Híbrido" },
    links: {
        github: "https://github.com/example",
        linkedin: "https://www.linkedin.com/in/example"
    }
})

describe("AboutNowCard", () => {
    it("mostra o cargo e a modalidade", () => {
        render(<AboutNowCard profile={profile} />)

        expect(screen.getByRole("complementary", { name: "Agora" })).toBeInTheDocument()
        expect(screen.getByText("Cargo")).toBeInTheDocument()
        expect(screen.getByText("Estagiário de Desenvolvimento Frontend")).toBeInTheDocument()
        expect(screen.getByText("Modalidade")).toBeInTheDocument()
        expect(screen.getByText("Híbrido")).toBeInTheDocument()
    })

    it("omite a modalidade quando o perfil não tem detalhe de local", () => {
        render(
            <AboutNowCard
                profile={buildProfile({
                    location: { city: "São José dos Campos", region: "SP", countryCode: "BR" }
                })}
            />
        )

        expect(screen.queryByText("Modalidade")).not.toBeInTheDocument()
    })

    it("liga o GitHub e o LinkedIn em nova aba", () => {
        render(<AboutNowCard profile={profile} />)

        const github = screen.getByRole("link", { name: /^GitHub de .* \(abre em nova aba\)$/ })
        const linkedin = screen.getByRole("link", { name: /^LinkedIn de .* \(abre em nova aba\)$/ })

        expect(github).toHaveAttribute("href", "https://github.com/example")
        expect(github).toHaveAttribute("target", "_blank")
        expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/example")
    })

    it("não mostra a lista de redes sem nenhum link", () => {
        render(<AboutNowCard profile={buildProfile({ links: {} })} />)

        expect(screen.queryByRole("list")).not.toBeInTheDocument()
        expect(screen.queryByRole("link")).not.toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<AboutNowCard profile={profile} />)

        await expectNoAxeViolations(container)
    }, 15000)
})
