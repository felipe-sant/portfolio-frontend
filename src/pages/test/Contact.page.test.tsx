import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import userEvent from "@testing-library/user-event"
import { act, screen, waitFor } from "@testing-library/react"
import setLanguage from "@/i18n/setLanguage"
import ContactPage from "@/pages/Contact.page"
import buildProfile from "@/testUtils/buildProfile"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import failFetchAfter from "@/testUtils/failFetchAfter"
import renderWithStore from "@/testUtils/renderWithStore"
import stubContentFetch from "@/testUtils/stubContentFetch"
import type Profile from "@/types/profile/Profile.types"

const flag = vi.hoisted(() => ({ enabled: false }))

vi.mock("@/utils/contactFormEnabled", () => ({
    get default() {
        return flag.enabled
    }
}))

const SITE_URL = "http://localhost:5173"

const PROFILE = buildProfile({
    location: {
        city: "São José dos Campos",
        region: "SP",
        countryCode: "BR",
        detail: "Remoto ou híbrido"
    },
    contact: {
        email: "contato@example.com",
        responseTime: { label: "Em até 1 dia útil", detail: "Fuso GMT-3" }
    }
})

function stubProfiles(profile: Profile = PROFILE) {
    return stubContentFetch({
        "content/pt-BR/profile.json": profile,
        "content/en/profile.json": profile,
        "content/es/profile.json": profile
    })
}

function renderPage() {
    return renderWithStore(
        <MemoryRouter>
            <ContactPage />
        </MemoryRouter>
    )
}

function readJsonLd() {
    const script = document.querySelector('script[type="application/ld+json"]')
    return JSON.parse(script?.textContent ?? "null")
}

beforeEach(() => {
    flag.enabled = false
    stubProfiles()
})

afterEach(() => {
    vi.unstubAllGlobals()
})

describe("ContactPage", () => {
    it("com a flag desligada mostra h1, abertura direta e canais, sem formulário", async () => {
        const { container } = renderPage()

        expect(screen.getByRole("heading", { level: 1, name: "Contato" })).toBeInTheDocument()
        expect(
            screen.getByText(
                "Projeto, freelance ou vaga: escreva para o meu e-mail contando o contexto e o prazo."
            )
        ).toBeInTheDocument()
        expect(await screen.findByText("contato@example.com")).toBeInTheDocument()
        expect(container.querySelector("form")).toBeNull()
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument()
        expect(screen.queryByText("Sem newsletter e sem cadastro.")).not.toBeInTheDocument()
    })

    it("com a flag ligada mostra a abertura do formulário e os canais depois dele", async () => {
        flag.enabled = true
        const { container } = renderPage()

        const form = await waitFor(() => {
            const element = container.querySelector("form")
            expect(element).toBeInTheDocument()
            return element as HTMLFormElement
        })
        const email = await screen.findByText("contato@example.com")

        expect(screen.getByText("Conte o escopo, o prazo e o que já existe.")).toBeInTheDocument()
        expect(form.compareDocumentPosition(email) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    })

    it("mostra o selo com o rótulo de disponibilidade e o esconde quando não há", async () => {
        const { unmount } = renderPage()

        expect(screen.queryByText("Disponível para projetos")).not.toBeInTheDocument()
        expect(await screen.findByText("Disponível para projetos")).toBeInTheDocument()
        unmount()

        stubProfiles(
            buildProfile({ ...PROFILE, availability: { isAvailable: false, label: "Fechado" } })
        )
        renderPage()
        await screen.findByText("contato@example.com")

        expect(screen.queryByText("Fechado")).not.toBeInTheDocument()
    })

    it("carregando mostra h1, abertura e formulário na hora e canais em skeleton", async () => {
        flag.enabled = true
        stubProfiles()
        const { container } = renderPage()

        expect(screen.getByRole("heading", { level: 1, name: "Contato" })).toBeInTheDocument()
        expect(screen.getByText("Conte o escopo, o prazo e o que já existe.")).toBeInTheDocument()
        expect(
            screen.getAllByRole("status").some((status) => status.textContent === "Carregando...")
        ).toBe(true)
        await waitFor(() => expect(container.querySelector("form")).toBeInTheDocument())
        await screen.findByText("contato@example.com")
    })

    it("erro do perfil mostra o alerta e Tentar novamente refaz a consulta", async () => {
        flag.enabled = true
        const allow = failFetchAfter(stubProfiles(), 0)
        renderPage()

        const alert = await screen.findByRole("alert")

        expect(alert).toHaveTextContent("Não foi possível carregar os canais de contato.")
        await waitFor(() => expect(document.querySelector("form")).toBeInTheDocument())

        allow()
        await userEvent.click(screen.getByRole("button", { name: "Tentar novamente" }))

        expect(await screen.findByText("contato@example.com")).toBeInTheDocument()
        expect(screen.queryByText("Não foi possível carregar os canais de contato.")).toBeNull()
    })

    it("declara título, descrição, canônica, hreflang, Open Graph e JSON-LD ContactPage", async () => {
        renderPage()

        expect(document.title).toBe("Contato · Luiz Felipe dos Santos")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Como falar com Luiz Felipe dos Santos: e-mail e currículo."
        )
        expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
            `${SITE_URL}/pt-BR/contact`
        )
        expect(document.head.querySelectorAll("link[rel='alternate'][hreflang]")).toHaveLength(4)
        expect(
            document.head.querySelector('meta[property="og:title"]')?.getAttribute("content")
        ).toBe("Contato · Luiz Felipe dos Santos")
        expect(
            document.head.querySelector('meta[name="twitter:card"]')?.getAttribute("content")
        ).toBeTruthy()
        expect(readJsonLd()["@type"]).toBe("ContactPage")
        await screen.findByText("contato@example.com")
        await waitFor(() =>
            expect(readJsonLd().mainEntity.email).toBe("mailto:contato@example.com")
        )
    })

    it("tem um h1 e nenhum main próprio", async () => {
        const { container } = renderPage()
        await screen.findByText("contato@example.com")

        expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
        expect(container.querySelector("main")).toBeNull()
    })

    it.each([
        [
            "en",
            "Contact",
            "Direct email",
            "Tell me the scope, the deadline and what already exists."
        ],
        ["es", "Contacto", "Correo directo", "Cuéntame el alcance, el plazo y lo que ya existe."]
    ] as const)(
        "traduz a tela, os metadados e o lang em %s sem chave",
        async (language, heading, channel, lede) => {
            flag.enabled = true
            await setLanguage(language)
            const { container } = renderPage()

            expect(screen.getByRole("heading", { level: 1, name: heading })).toBeInTheDocument()
            expect(screen.getByText(lede)).toBeInTheDocument()
            expect(await screen.findByText(channel)).toBeInTheDocument()
            expect(document.documentElement.lang).toBe(language)
            expect(document.head.querySelector('link[rel="canonical"]')?.getAttribute("href")).toBe(
                `${SITE_URL}/${language}/contact`
            )
            expect(container).not.toHaveTextContent(/contact:|channels\.|lede\./)
        }
    )

    it("atualiza o texto ao trocar o idioma com a página aberta", async () => {
        renderPage()
        await screen.findByText("contato@example.com")

        await act(() => setLanguage("en"))

        expect(screen.getByRole("heading", { level: 1, name: "Contact" })).toBeInTheDocument()
        expect(document.title).toBe("Contact · Luiz Felipe dos Santos")
    })

    it("não tem violações de acessibilidade com a flag desligada e ligada", async () => {
        const { container, unmount } = renderPage()
        await screen.findByText("contato@example.com")

        await expectNoAxeViolations(container)
        unmount()

        flag.enabled = true
        const view = renderPage()
        await screen.findByText("contato@example.com")
        await waitFor(() => expect(view.container.querySelector("form")).toBeInTheDocument())

        await expectNoAxeViolations(view.container)
    }, 15000)
})
