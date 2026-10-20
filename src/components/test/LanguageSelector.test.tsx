import { describe, expect, it } from "vitest"
import { act, render, screen, within } from "@testing-library/react"
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
    await screen.findByRole("group")
    return { router, ...utils }
}

describe("LanguageSelector", () => {
    it("agrupa as opções com o nome Idioma", async () => {
        await renderSelector()

        expect(screen.getByRole("group", { name: "Idioma" })).toBeInTheDocument()
    })

    it("aponta cada opção para a URL equivalente preservando query e âncora", async () => {
        await renderSelector()
        const group = screen.getByRole("group", { name: "Idioma" })

        expect(within(group).getByRole("link", { name: "PT Português" })).toHaveAttribute(
            "href",
            "/pt-BR/projects?q=a#topo"
        )
        expect(within(group).getByRole("link", { name: "EN English" })).toHaveAttribute(
            "href",
            "/en/projects?q=a#topo"
        )
        expect(within(group).getByRole("link", { name: "ES Español" })).toHaveAttribute(
            "href",
            "/es/projects?q=a#topo"
        )
    })

    it("define hreflang e lang do destino", async () => {
        await renderSelector()
        const link = screen.getByRole("link", { name: "EN English" })

        expect(link).toHaveAttribute("hreflang", "en")
        expect(link).toHaveAttribute("lang", "en")
    })

    it("marca com aria-current só o idioma ativo", async () => {
        await renderSelector()

        expect(screen.getByRole("link", { name: "PT Português" })).toHaveAttribute(
            "aria-current",
            "true"
        )
        expect(screen.getByRole("link", { name: "EN English" })).not.toHaveAttribute("aria-current")
        expect(screen.getByRole("link", { name: "ES Español" })).not.toHaveAttribute("aria-current")
    })

    it("ignora ?lng= na URL", async () => {
        await renderSelector("/pt-BR?lng=en")

        expect(screen.getByRole("link", { name: "PT Português" })).toHaveAttribute(
            "aria-current",
            "true"
        )
    })

    it("troca de idioma, salva a escolha e mantém o foco na opção", async () => {
        const { router } = await renderSelector()

        await userEvent.click(screen.getByRole("link", { name: "EN English" }))

        expect(router.state.location.pathname).toBe("/en/projects")
        expect(router.state.location.search).toBe("?q=a")
        expect(router.state.location.hash).toBe("#topo")
        expect(document.documentElement).toHaveAttribute("lang", "en")
        expect(document.title).toBe("Language")
        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe("en")
        expect(screen.getByRole("link", { name: "EN English" })).toHaveFocus()
    })

    it("não grava escolha ao chegar por navegação", async () => {
        const { router } = await renderSelector()

        await act(async () => {
            await router.navigate("/en/projects")
        })

        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBeNull()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = await renderSelector()

        await expectNoAxeViolations(container)
    }, 15000)
})
