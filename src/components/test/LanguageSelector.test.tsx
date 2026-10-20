import { describe, expect, it } from "vitest"
import { act, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom"
import LanguageSelector from "@/components/LanguageSelector"
import LANGUAGE_STORAGE_KEY from "@/i18n/languageStorageKey"
import createLanguageLoader from "@/routers/createLanguageLoader"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"
import SUPPORTED_LANGUAGES from "@/i18n/supportedLanguages"
import { useTranslation } from "react-i18next"

function Frame() {
    const { t } = useTranslation()

    return (
        <div>
            <title>{t("languageSelector.label")}</title>
            <LanguageSelector />
            <Outlet />
        </div>
    )
}

async function renderSelector(entry = "/pt-BR/projects?q=a#topo") {
    const router = createMemoryRouter(
        SUPPORTED_LANGUAGES.map((language) => ({
            path: language,
            element: <Frame />,
            loader: createLanguageLoader(language),
            children: [{ path: "*", element: <p>conteúdo</p> }]
        })),
        { initialEntries: [entry] }
    )
    const utils = render(<RouterProvider router={router} />)
    await screen.findByRole("button", { name: /Idioma:|Language:/ })
    return { router, ...utils }
}

async function openList() {
    await userEvent.click(screen.getByRole("button", { name: "Idioma: Português" }))
}

describe("LanguageSelector", () => {
    it("mostra só o botão com o idioma ativo e a lista fechada", async () => {
        await renderSelector()
        const button = screen.getByRole("button", { name: "Idioma: Português" })

        expect(button).toHaveAttribute("aria-expanded", "false")
        expect(screen.queryByRole("link")).not.toBeInTheDocument()
    })

    it("abre a lista com os três idiomas", async () => {
        await renderSelector()

        await openList()

        expect(screen.getByRole("button", { name: "Idioma: Português" })).toHaveAttribute(
            "aria-expanded",
            "true"
        )
        expect(screen.getAllByRole("link").map((link) => link.textContent)).toEqual([
            "Português",
            "English",
            "Español"
        ])
    })

    it("aponta cada opção para a URL equivalente preservando query e âncora", async () => {
        await renderSelector()
        await openList()

        expect(screen.getByRole("link", { name: "Português" })).toHaveAttribute(
            "href",
            "/pt-BR/projects?q=a#topo"
        )
        expect(screen.getByRole("link", { name: "English" })).toHaveAttribute(
            "href",
            "/en/projects?q=a#topo"
        )
        expect(screen.getByRole("link", { name: "Español" })).toHaveAttribute(
            "href",
            "/es/projects?q=a#topo"
        )
    })

    it("define hreflang e lang do destino", async () => {
        await renderSelector()
        await openList()
        const link = screen.getByRole("link", { name: "English" })

        expect(link).toHaveAttribute("hreflang", "en")
        expect(link).toHaveAttribute("lang", "en")
    })

    it("marca com aria-current só o idioma ativo", async () => {
        await renderSelector()
        await openList()

        expect(screen.getByRole("link", { name: "Português" })).toHaveAttribute(
            "aria-current",
            "true"
        )
        expect(screen.getByRole("link", { name: "English" })).not.toHaveAttribute("aria-current")
        expect(screen.getByRole("link", { name: "Español" })).not.toHaveAttribute("aria-current")
    })

    it("ignora ?lng= na URL", async () => {
        await renderSelector("/pt-BR?lng=en")
        await openList()

        expect(screen.getByRole("link", { name: "Português" })).toHaveAttribute(
            "aria-current",
            "true"
        )
    })

    it("troca de idioma, salva a escolha, fecha a lista e devolve o foco ao botão", async () => {
        const { router } = await renderSelector()
        await openList()

        await userEvent.click(screen.getByRole("link", { name: "English" }))

        expect(router.state.location.pathname).toBe("/en/projects")
        expect(router.state.location.search).toBe("?q=a")
        expect(router.state.location.hash).toBe("#topo")
        expect(document.documentElement).toHaveAttribute("lang", "en")
        expect(document.title).toBe("Language")
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en")
        await waitFor(() => expect(screen.queryByRole("link")).not.toBeInTheDocument())
        expect(await screen.findByRole("button", { name: "Language: English" })).toHaveFocus()
    })

    it("fecha a lista com Escape e foca o botão", async () => {
        await renderSelector()
        await openList()

        await userEvent.keyboard("{Escape}")

        await waitFor(() => expect(screen.queryByRole("link")).not.toBeInTheDocument())
        expect(screen.getByRole("button", { name: "Idioma: Português" })).toHaveFocus()
    })

    it("fecha a lista ao clicar fora", async () => {
        await renderSelector()
        await openList()

        await userEvent.click(screen.getByText("conteúdo"))

        await waitFor(() => expect(screen.queryByRole("link")).not.toBeInTheDocument())
    })

    it("não grava escolha ao chegar por navegação", async () => {
        const { router } = await renderSelector()

        await act(async () => {
            await router.navigate("/en/projects")
        })

        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
    })

    it("não tem violações de acessibilidade com a lista fechada e aberta", async () => {
        const { container } = await renderSelector()

        await expectNoAxeViolations(container)
        await openList()
        await expectNoAxeViolations(container)
    }, 15000)
})
