import { afterEach, describe, expect, it, vi } from "vitest"
import { act, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RouterProvider, createMemoryRouter } from "react-router-dom"
import Footer from "@/components/Footer"
import setLanguage from "@/i18n/setLanguage"
import buildProfile from "@/testUtils/buildProfile"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"
import getAppVersion from "@/utils/getAppVersion"

const LINKS = {
    github: "https://github.com/example",
    linkedin: "https://www.linkedin.com/in/example"
}

function stubProfiles(links: { github?: string; linkedin?: string } = LINKS) {
    return stubContentFetch({
        "content/pt-BR/profile.json": buildProfile({
            availability: { isAvailable: true, label: "Disponível para projetos" },
            links
        }),
        "content/en/profile.json": buildProfile({
            availability: { isAvailable: true, label: "Available for projects" },
            location: { city: "São José dos Campos", region: "SP", countryCode: "BR" },
            links
        }),
        "content/es/profile.json": buildProfile({
            availability: { isAvailable: true, label: "Disponible para proyectos" },
            links
        })
    })
}

function renderFooter(variant: "default" | "navigation" = "default") {
    const router = createMemoryRouter([{ path: "*", element: <Footer variant={variant} /> }], {
        initialEntries: ["/pt-BR"]
    })

    return renderWithStore(<RouterProvider router={router} />)
}

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("Footer padrão", () => {
    it("renderiza o landmark contentinfo", async () => {
        stubProfiles()
        renderFooter()

        expect(screen.getByRole("contentinfo")).toBeInTheDocument()
        await screen.findByText("Disponível para projetos")
    })

    it("mostra disponibilidade, localização, e-mail e copiar e-mail com o perfil", async () => {
        stubProfiles()
        renderFooter()

        expect(await screen.findByText("Disponível para projetos")).toBeInTheDocument()
        expect(screen.getByText("São José dos Campos · SP")).toBeInTheDocument()
        expect(screen.getByText("contato@example.com")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Copiar e-mail" })).toBeInTheDocument()
        expect(screen.getByText("Contato")).toBeInTheDocument()
    })

    it("mostra os ícones de rede com nome acessível e atributos de abertura", async () => {
        stubProfiles()
        renderFooter()

        const github = await screen.findByRole("link", {
            name: "GitHub de Luiz Felipe dos Santos (abre em nova aba)"
        })
        const linkedin = screen.getByRole("link", {
            name: "LinkedIn de Luiz Felipe dos Santos (abre em nova aba)"
        })
        const mail = screen.getByRole("link", { name: "Enviar e-mail para Luiz Felipe dos Santos" })

        expect(github).toHaveAttribute("href", LINKS.github)
        expect(github).toHaveAttribute("target", "_blank")
        expect(github).toHaveAttribute("rel", "noopener noreferrer")
        expect(linkedin).toHaveAttribute("href", LINKS.linkedin)
        expect(linkedin).toHaveAttribute("target", "_blank")
        expect(mail).toHaveAttribute("href", "mailto:contato@example.com")
        expect(mail).not.toHaveAttribute("target")
    })

    it("omite a rede sem URL no perfil", async () => {
        stubProfiles({ github: LINKS.github })
        renderFooter()

        await screen.findByRole("link", { name: /GitHub de/ })

        expect(screen.queryByRole("link", { name: /LinkedIn de/ })).not.toBeInTheDocument()
    })

    it("mostra só o rótulo, o link de contato e a barra sem perfil, sem erro", async () => {
        const fetchMock = stubContentFetch({})
        renderFooter()

        expect(screen.getByText("Contato")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Entrar em contato" })).toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Copiar e-mail" })).not.toBeInTheDocument()

        await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled())
        await act(async () => {})

        expect(screen.queryByRole("alert")).not.toBeInTheDocument()
        expect(screen.queryByText("contato@example.com")).not.toBeInTheDocument()
        expect(screen.getByText(`v${getAppVersion()}`)).toBeInTheDocument()
    })

    it.each([
        ["pt-BR", "/pt-BR/contact", "Entrar em contato"],
        ["en", "/en/contact", "Get in touch"],
        ["es", "/es/contact", "Ponerse en contacto"]
    ] as const)("aponta Entrar em contato para o prefixo de %s", async (language, href, name) => {
        stubProfiles()
        await setLanguage(language)
        renderFooter()

        expect(screen.getByRole("link", { name })).toHaveAttribute("href", href)
        await screen.findByText(/Dispon|Available/)
    })

    it("mostra o ano do build e a versão do projeto", async () => {
        stubProfiles()
        renderFooter()

        expect(
            screen.getByText(`© ${new Date().getFullYear()} · Luiz Felipe dos Santos`)
        ).toBeInTheDocument()
        expect(screen.getByText(`v${getAppVersion()}`)).toBeInTheDocument()
        await screen.findByText("Disponível para projetos")
    })

    it("traduz os textos em en e es", async () => {
        stubProfiles()
        renderFooter()
        await screen.findByText("Disponível para projetos")

        await act(() => setLanguage("en"))

        expect(await screen.findByText("Available for projects")).toBeInTheDocument()
        expect(screen.getByText("Contact")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Copy email" })).toBeInTheDocument()
        expect(screen.getByText(`v${getAppVersion()}`)).toBeInTheDocument()

        await act(() => setLanguage("es"))

        expect(await screen.findByText("Disponible para proyectos")).toBeInTheDocument()
        expect(screen.getByText("Contacto")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Copiar correo" })).toBeInTheDocument()
        expect(screen.getByText(`v${getAppVersion()}`)).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        stubProfiles()
        const { container } = renderFooter()
        await screen.findByText("Disponível para projetos")

        await expectNoAxeViolations(container)
    }, 15000)
})

describe("Footer de navegação", () => {
    it("mostra o nav Rodapé com os três links no prefixo do idioma", async () => {
        stubProfiles()
        renderFooter("navigation")
        await screen.findByRole("link", { name: /GitHub de/ })

        const nav = screen.getByRole("navigation", { name: "Rodapé" })

        expect(within(nav).getAllByRole("link")).toHaveLength(3)
        expect(within(nav).getByRole("link", { name: "Início" })).toHaveAttribute("href", "/pt-BR")
        expect(within(nav).getByRole("link", { name: "Projetos" })).toHaveAttribute(
            "href",
            "/pt-BR/projects"
        )
        expect(within(nav).getByRole("link", { name: "Informações" })).toHaveAttribute(
            "href",
            "/pt-BR/about"
        )
    })

    it("não mostra chamada para contato, e-mail nem copiar e-mail", async () => {
        stubProfiles()
        renderFooter("navigation")
        await screen.findByRole("link", { name: /GitHub de/ })

        expect(screen.queryByRole("link", { name: "Entrar em contato" })).not.toBeInTheDocument()
        expect(screen.queryByText("contato@example.com")).not.toBeInTheDocument()
        expect(screen.queryByRole("button", { name: "Copiar e-mail" })).not.toBeInTheDocument()
    })

    it("mostra as redes com texto visível e abertura em nova aba", async () => {
        stubProfiles()
        renderFooter("navigation")

        const github = await screen.findByRole("link", { name: /GitHub de/ })

        expect(github).toHaveTextContent("GitHub↗")
        expect(github).toHaveAttribute("target", "_blank")
        expect(github).toHaveAttribute("rel", "noopener noreferrer")
        expect(screen.getByRole("link", { name: /LinkedIn de/ })).toHaveAttribute(
            "href",
            LINKS.linkedin
        )
    })

    it("mostra Currículo em PDF como botão desabilitado com o estado no nome", async () => {
        stubProfiles()
        renderFooter("navigation")
        await screen.findByRole("link", { name: /GitHub de/ })

        const resume = screen.getByRole("button", {
            name: "Currículo em PDF, indisponível no momento"
        })

        expect(resume).toBeDisabled()
        expect(resume).not.toHaveAttribute("href")
        expect(resume).toHaveTextContent("Currículo em PDF↓")
        await userEvent.click(resume)
        await userEvent.tab()
        expect(resume).not.toHaveFocus()
    })

    it("mostra a barra inferior igual", async () => {
        stubProfiles()
        renderFooter("navigation")

        expect(
            screen.getByText(`© ${new Date().getFullYear()} · Luiz Felipe dos Santos`)
        ).toBeInTheDocument()
        expect(screen.getByText(`v${getAppVersion()}`)).toBeInTheDocument()
        await screen.findByRole("link", { name: /GitHub de/ })
    })

    it("traduz em en e es", async () => {
        stubProfiles()
        renderFooter("navigation")
        await screen.findByRole("link", { name: /GitHub de/ })

        await act(() => setLanguage("en"))

        expect(screen.getByRole("navigation", { name: "Footer" })).toBeInTheDocument()
        expect(screen.getByText("Navigation")).toBeInTheDocument()
        expect(screen.getByText("Social")).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Resume in PDF, currently unavailable" })
        ).toBeDisabled()

        await act(() => setLanguage("es"))

        expect(screen.getByRole("navigation", { name: "Pie de página" })).toBeInTheDocument()
        expect(screen.getByText("Navegación")).toBeInTheDocument()
        expect(
            screen.getByRole("button", { name: "Currículum en PDF, no disponible por ahora" })
        ).toBeDisabled()
    })

    it("não tem violações de acessibilidade", async () => {
        stubProfiles()
        const { container } = renderFooter("navigation")
        await screen.findByRole("link", { name: /GitHub de/ })

        await expectNoAxeViolations(container)
    }, 15000)
})
