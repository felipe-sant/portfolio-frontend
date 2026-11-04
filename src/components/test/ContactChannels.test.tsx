import { describe, expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import ContactChannels from "@/components/ContactChannels"
import setLanguage from "@/i18n/setLanguage"
import buildProfile from "@/testUtils/buildProfile"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const PROFILE = buildProfile({
    location: {
        city: "São José dos Campos",
        region: "SP",
        countryCode: "BR",
        detail: "Remoto ou híbrido na região"
    },
    contact: {
        email: "contato@example.com",
        responseTime: { label: "Em até 1 dia útil", detail: "Fuso GMT-3" }
    }
})

describe("ContactChannels", () => {
    it("mostra os rótulos dos canais em h2, sem aside nem landmark próprio", () => {
        const { container } = render(<ContactChannels profile={PROFILE} />)

        expect(
            screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)
        ).toEqual(["E-mail direto", "Localização", "Resposta"])
        expect(container.querySelector("aside")).toBeNull()
        expect(screen.queryByRole("complementary")).not.toBeInTheDocument()
        expect(screen.queryByRole("region")).not.toBeInTheDocument()
    })

    it("mostra o e-mail inteiro, copiar e o link mailto sem target", () => {
        render(<ContactChannels profile={PROFILE} />)
        const mailLink = screen.getByRole("link", { name: "Enviar e-mail" })

        expect(screen.getByText("contato@example.com")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Copiar e-mail" })).toBeInTheDocument()
        expect(screen.getByRole("status")).toBeEmptyDOMElement()
        expect(mailLink).toHaveAttribute("href", "mailto:contato@example.com")
        expect(mailLink).not.toHaveAttribute("target")
    })

    it("mostra a localização com cidade, região e detalhe", () => {
        render(<ContactChannels profile={PROFILE} />)

        expect(screen.getByText("São José dos Campos · SP")).toBeInTheDocument()
        expect(screen.getByText("Remoto ou híbrido na região")).toBeInTheDocument()
    })

    it("mostra a resposta com linha principal e detalhe", () => {
        render(<ContactChannels profile={PROFILE} />)

        expect(screen.getByText("Em até 1 dia útil")).toBeInTheDocument()
        expect(screen.getByText("Fuso GMT-3")).toBeInTheDocument()
    })

    it("sem responseTime o bloco Resposta some", () => {
        render(<ContactChannels profile={buildProfile({ contact: { email: "a@b.co" } })} />)

        expect(screen.queryByRole("heading", { name: "Resposta" })).not.toBeInTheDocument()
    })

    it("sem detalhe a linha some", () => {
        render(
            <ContactChannels
                profile={buildProfile({
                    contact: { email: "a@b.co", responseTime: { label: "Em até 1 dia útil" } }
                })}
            />
        )

        expect(screen.getByText("Em até 1 dia útil")).toBeInTheDocument()
        expect(screen.queryByText("Fuso GMT-3")).not.toBeInTheDocument()
        expect(screen.queryByText("Remoto ou híbrido na região")).not.toBeInTheDocument()
    })

    it("Baixar CV é botão desabilitado sem href, com o nome acessível de indisponível", () => {
        render(<ContactChannels profile={PROFILE} />)
        const resume = screen.getByRole("button", {
            name: "Baixar CV (PDF), indisponível no momento"
        })

        expect(resume).toBeDisabled()
        expect(resume).toHaveTextContent("Baixar CV")
        expect(resume).not.toHaveAttribute("href")
        expect(screen.queryByRole("link", { name: /CV/ })).not.toBeInTheDocument()
    })

    it("não tem agendamento, lista de redes nem vaga fixa", () => {
        render(<ContactChannels profile={PROFILE} />)

        expect(screen.queryByText(/Agendar/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Procurando vaga fixa/)).not.toBeInTheDocument()
        expect(screen.queryByRole("link", { name: /GitHub|LinkedIn/ })).not.toBeInTheDocument()
    })

    it("carregando: skeleton aria-hidden e Carregando em status oculto", () => {
        const { container } = render(<ContactChannels />)

        expect(screen.getByRole("status")).toHaveTextContent("Carregando...")
        expect(container.querySelectorAll('[aria-hidden="true"]').length).toBeGreaterThan(0)
        expect(screen.queryByText("contato@example.com")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Copiar e-mail" })).not.toBeInTheDocument()
    })

    it.each([
        ["en", ["Direct email", "Location", "Response", "Send email", "Copy email"]],
        ["es", ["Correo directo", "Ubicación", "Respuesta", "Enviar correo", "Copiar correo"]]
    ])("mostra o texto traduzido em %s sem chave", async (language, texts) => {
        render(<ContactChannels profile={PROFILE} />)

        await act(() => setLanguage(language === "en" ? "en" : "es"))

        texts.forEach((text) => {
            expect(screen.getByText(text)).toBeInTheDocument()
        })
        expect(screen.queryByText(/channels\.|resume\./)).not.toBeInTheDocument()
        expect(
            screen.getByRole("button", {
                name:
                    language === "en"
                        ? "Download CV (PDF), currently unavailable"
                        : "Descargar CV (PDF), no disponible por ahora"
            })
        ).toBeDisabled()
    })

    it("não tem violações de acessibilidade nos estados normal e carregando", async () => {
        const { container, rerender } = render(<ContactChannels profile={PROFILE} />)

        await expectNoAxeViolations(container)

        rerender(<ContactChannels />)

        await expectNoAxeViolations(container)
    }, 15000)
})
