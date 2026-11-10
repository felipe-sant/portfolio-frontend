import type { ReactElement, ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, render as baseRender, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ContactChannels from "@/components/ContactChannels"
import setLanguage from "@/i18n/setLanguage"
import buildProfile from "@/testUtils/buildProfile"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function RouterWrapper({ children }: { children: ReactNode }) {
    return <MemoryRouter>{children}</MemoryRouter>
}

function render(ui: ReactElement) {
    return baseRender(ui, { wrapper: RouterWrapper })
}

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

    it("Baixar CV é link do PDF com o nome acessível de pré-visualização", () => {
        render(<ContactChannels profile={PROFILE} />)
        const resume = screen.getByRole("link", {
            name: "Baixar CV (PDF), abre a pré-visualização"
        })

        expect(resume).toHaveTextContent("Baixar CV")
        expect(resume).toHaveAttribute("href", "/cv/cv-pt-BR.pdf")
        expect(resume).not.toHaveAttribute("download")
        expect(resume).not.toHaveAttribute("target")
        expect(screen.queryByRole("button", { name: /Baixar CV/ })).not.toBeInTheDocument()
    })

    it("clicar em Baixar CV abre o modal do PDF", async () => {
        render(<ContactChannels profile={PROFILE} />)
        const resume = screen.getByRole("link", { name: /Baixar CV/ })

        await userEvent.click(resume)

        const dialog = screen.getByRole("dialog", { name: "Currículo" })
        expect(within(dialog).getByTitle("Currículo em PDF")).toHaveAttribute(
            "src",
            "/cv/cv-pt-BR.pdf"
        )
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

    it("carregando: mostra os mesmos blocos e o botão do CV, na mesma ordem, do conteúdo carregado", () => {
        const { unmount } = render(<ContactChannels profile={PROFILE} />)
        const loadedHeadings = screen
            .getAllByRole("heading", { level: 2 })
            .map((h) => h.textContent)
        unmount()

        const { container: loadingContainer } = render(<ContactChannels />)
        const loadingHeadings = screen
            .getAllByRole("heading", { level: 2 })
            .map((heading) => heading.textContent)
        const resumeLink = within(loadingContainer).getByRole("link", { name: /CV/ })

        expect(loadingHeadings).toEqual(loadedHeadings)
        expect(screen.getAllByRole("status")).toHaveLength(1)
        expect(resumeLink).toBeInTheDocument()
    })

    it("carregando: o skeleton do e-mail reserva a linha do e-mail e uma ação por botão, aria-hidden", () => {
        const { container } = render(<ContactChannels />)
        const emailBlock = screen.getByRole("heading", { name: "E-mail direto" }).parentElement

        expect(emailBlock?.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(3)
        expect(container.querySelectorAll("a[href^='mailto:']")).toHaveLength(0)
    })

    it("sem responseTime o skeleton mantém o bloco Resposta e o conteúdo carregado o remove sem trocar a ordem dos demais", () => {
        const { rerender } = render(<ContactChannels />)

        expect(screen.getByRole("heading", { name: "Resposta" })).toBeInTheDocument()

        rerender(<ContactChannels profile={buildProfile({ contact: { email: "a@b.co" } })} />)

        expect(
            screen.getAllByRole("heading", { level: 2 }).map((heading) => heading.textContent)
        ).toEqual(["E-mail direto", "Localização"])
    })

    it.each(["en", "es"] as const)("aponta o CV para o PDF de %s", async (language) => {
        render(<ContactChannels profile={PROFILE} />)

        await act(() => setLanguage(language))

        expect(
            screen.getByRole("link", { name: /^(Download CV|Descargar CV) \(PDF\)/ })
        ).toHaveAttribute("href", `/cv/cv-${language}.pdf`)
    })

    it("não tem violações de acessibilidade nos estados normal e carregando", async () => {
        const { container, rerender } = render(<ContactChannels profile={PROFILE} />)

        await expectNoAxeViolations(container)

        rerender(<ContactChannels />)

        await expectNoAxeViolations(container)
    })
})
