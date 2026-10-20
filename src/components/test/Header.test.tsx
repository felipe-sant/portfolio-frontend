import { afterEach, describe, expect, it } from "vitest"
import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, RouterProvider } from "react-router-dom"
import Header from "@/components/Header"
import useMobileMenu from "@/hooks/useMobileMenu"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import createLanguageLoader from "@/routers/createLanguageLoader"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import stubViewTransition from "@/testUtils/stubViewTransition"
import MOTION_STORAGE_KEY from "@/utils/motionStorageKey"
import type NavItemId from "@/types/navigation/NavItemId.types"

interface FrameProps {
    activeItem?: NavItemId
}

function Frame({ activeItem }: FrameProps) {
    const menu = useMobileMenu()

    return <Header menu={menu} activeItem={activeItem} />
}

async function renderHeader(activeItem?: NavItemId, entry = "/pt-BR") {
    const router = createMemoryRouter(
        SUPPORTED_LANGUAGES.map((language) => ({
            path: `/${language}/*`,
            element: <Frame activeItem={activeItem} />,
            loader: createLanguageLoader(language)
        })),
        { initialEntries: [entry] }
    )
    const utils = render(<RouterProvider router={router} />)
    await screen.findByRole("banner")
    return { router, ...utils }
}

function getPanel() {
    return document.getElementById(
        screen.getByRole("button", { name: "Menu" }).getAttribute("aria-controls") ?? ""
    ) as HTMLElement
}

afterEach(() => {
    Reflect.deleteProperty(document, "startViewTransition")
    localStorage.removeItem(MOTION_STORAGE_KEY)
    document.documentElement.removeAttribute("data-motion")
})

describe("Header", () => {
    it("expõe banner e navegação Principal", async () => {
        await renderHeader()

        expect(screen.getByRole("banner")).toBeInTheDocument()
        expect(screen.getAllByRole("navigation", { name: "Principal", hidden: true })).toHaveLength(
            2
        )
    })

    it("mostra o logo com o nome do autor levando ao início do idioma", async () => {
        await renderHeader()
        const logo = screen.getByRole("link", { name: "Luiz Felipe dos Santos" })

        expect(logo).toHaveAttribute("href", "/pt-BR")
        expect(screen.queryByRole("heading")).not.toBeInTheDocument()
    })

    it("aponta os quatro links com o prefixo do idioma", async () => {
        await renderHeader()
        const nav = screen.getAllByRole("navigation", { name: "Principal", hidden: true })[0]

        expect(within(nav).getByRole("link", { name: "Início" })).toHaveAttribute("href", "/pt-BR")
        expect(within(nav).getByRole("link", { name: "Projetos" })).toHaveAttribute(
            "href",
            "/pt-BR/projects"
        )
        expect(within(nav).getByRole("link", { name: "Informações" })).toHaveAttribute(
            "href",
            "/pt-BR/about"
        )
        expect(within(nav).getByRole("link", { name: "Contato" })).toHaveAttribute(
            "href",
            "/pt-BR/contact"
        )
    })

    it("usa o prefixo do idioma ativo nos links", async () => {
        await renderHeader(undefined, "/en")
        const nav = screen.getAllByRole("navigation", { name: "Main", hidden: true })[0]

        expect(within(nav).getByRole("link", { name: "Projects" })).toHaveAttribute(
            "href",
            "/en/projects"
        )
    })

    it("marca com aria-current só o item ativo", async () => {
        await renderHeader("projects")
        const nav = screen.getAllByRole("navigation", { name: "Principal", hidden: true })[0]

        expect(within(nav).getByRole("link", { name: "Projetos" })).toHaveAttribute(
            "aria-current",
            "page"
        )
        expect(within(nav).getAllByRole("link", { current: "page" })).toHaveLength(1)
    })

    it("não marca nenhum item sem activeItem", async () => {
        await renderHeader()

        expect(screen.queryAllByRole("link", { current: "page", hidden: true })).toHaveLength(0)
    })

    it("começa com o menu fechado e o painel escondido", async () => {
        await renderHeader()
        const button = screen.getByRole("button", { name: "Menu" })

        expect(button).toHaveAttribute("aria-expanded", "false")
        expect(getPanel()).toHaveAttribute("hidden")
    })

    it("abre o painel, foca o primeiro link e troca o ícone", async () => {
        const { container } = await renderHeader()
        const button = screen.getByRole("button", { name: "Menu" })
        const closedIcon = button.querySelector("svg")?.innerHTML

        await userEvent.click(button)

        expect(button).toHaveAttribute("aria-expanded", "true")
        expect(getPanel()).not.toHaveAttribute("hidden")
        expect(within(getPanel()).getAllByRole("link")[0]).toHaveFocus()
        expect(button.querySelector("svg")?.innerHTML).not.toBe(closedIcon)
        expect(container.querySelector("a[inert]")).toBeInTheDocument()
    })

    it("fecha por Esc devolvendo o foco ao botão", async () => {
        await renderHeader()
        const button = screen.getByRole("button", { name: "Menu" })
        await userEvent.click(button)

        await userEvent.keyboard("{Escape}")

        expect(button).toHaveAttribute("aria-expanded", "false")
        expect(button).toHaveFocus()
    })

    it("fecha pelo botão", async () => {
        await renderHeader()
        const button = screen.getByRole("button", { name: "Menu" })

        await userEvent.click(button)
        await userEvent.click(button)

        expect(button).toHaveAttribute("aria-expanded", "false")
        expect(getPanel()).toHaveAttribute("hidden")
    })

    it("fecha ao clicar num link do painel", async () => {
        await renderHeader()
        const button = screen.getByRole("button", { name: "Menu" })
        await userEvent.click(button)

        await userEvent.click(within(getPanel()).getByRole("link", { name: "Contato" }))

        expect(button).toHaveAttribute("aria-expanded", "false")
    })

    it("não fecha e mantém o foco ao trocar de idioma dentro do painel", async () => {
        await renderHeader()
        const button = screen.getByRole("button", { name: "Menu" })
        await userEvent.click(button)

        await userEvent.click(within(getPanel()).getByRole("button", { name: "Idioma: Português" }))

        await userEvent.click(within(getPanel()).getByRole("link", { name: "English" }))

        expect(button).toHaveAttribute("aria-expanded", "true")
        expect(
            await within(getPanel()).findByRole("button", { name: "Language: English" })
        ).toHaveFocus()
    })

    it("reúne tema e movimento no menu de configurações do cabeçalho", async () => {
        await renderHeader()
        const settings = screen.getByRole("button", { name: "Configurações" })

        await userEvent.click(settings)

        expect(settings).toHaveAttribute("aria-expanded", "true")
        expect(screen.getByRole("button", { name: "Tema escuro" })).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Reduzir movimento" })).toBeInTheDocument()
    })

    it("oferece o botão de movimento no painel do menu mobile", async () => {
        await renderHeader()
        await userEvent.click(screen.getByRole("button", { name: "Menu" }))

        expect(
            within(getPanel()).getByRole("button", { name: "Reduzir movimento" })
        ).toBeInTheDocument()
    })

    it("não fecha e mantém o foco ao trocar de tema dentro do painel", async () => {
        await renderHeader()
        const button = screen.getByRole("button", { name: "Menu" })
        await userEvent.click(button)
        const toggle = within(getPanel()).getByRole("button", { name: "Tema escuro" })

        await userEvent.click(toggle)

        expect(button).toHaveAttribute("aria-expanded", "true")
        expect(toggle).toHaveFocus()
    })

    it("mostra os rótulos Idioma e Tema no painel", async () => {
        await renderHeader()

        expect(within(getPanel()).getAllByText("Idioma", { selector: "p" })).toHaveLength(1)
        expect(within(getPanel()).getByText("Tema", { selector: "p" })).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade com o menu fechado", async () => {
        const { container } = await renderHeader()

        await expectNoAxeViolations(container)
    }, 15000)

    it("usa View Transition ao navegar por um item do cabeçalho com movimento pleno", async () => {
        const startViewTransition = stubViewTransition()
        await renderHeader()
        const nav = screen.getAllByRole("navigation", { name: "Principal", hidden: true })[0]

        await userEvent.click(within(nav).getByRole("link", { name: "Projetos" }))

        await waitFor(() => expect(startViewTransition).toHaveBeenCalledTimes(1))
    })

    it("usa View Transition ao navegar pelo logo com movimento pleno", async () => {
        const startViewTransition = stubViewTransition()
        await renderHeader(undefined, "/pt-BR/projects")

        await userEvent.click(screen.getByRole("link", { name: "Luiz Felipe dos Santos" }))

        await waitFor(() => expect(startViewTransition).toHaveBeenCalledTimes(1))
    })

    it("não usa View Transition com movimento reduzido", async () => {
        localStorage.setItem(MOTION_STORAGE_KEY, "reduced")
        const startViewTransition = stubViewTransition()
        const { router } = await renderHeader()
        const nav = screen.getAllByRole("navigation", { name: "Principal", hidden: true })[0]

        await userEvent.click(within(nav).getByRole("link", { name: "Projetos" }))

        await waitFor(() => expect(router.state.location.pathname).toBe("/pt-BR/projects"))
        expect(startViewTransition).not.toHaveBeenCalled()
    })

    it("não usa View Transition ao trocar só de idioma", async () => {
        const startViewTransition = stubViewTransition()
        const { router } = await renderHeader()

        await userEvent.click(screen.getAllByRole("button", { name: "Idioma: Português" })[0])
        await userEvent.click(screen.getAllByRole("link", { name: "English" })[0])

        await waitFor(() => expect(router.state.location.pathname).toBe("/en"))
        expect(startViewTransition).not.toHaveBeenCalled()
    })
})
