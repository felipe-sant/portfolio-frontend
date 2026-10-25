import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import UI_TEXTS from "./support/uiTexts"

const DESKTOP_MIN_WIDTH = 640
const BELOW_DESKTOP_WIDTH = 639
const MOBILE_WIDTH = 390
const VIEWPORT_HEIGHT = 844
const LANGUAGES = ["pt-BR", "en", "es"] as const
const NAV_ITEMS = [
    { id: "home", path: "" },
    { id: "projects", path: "/projects" },
    { id: "about", path: "/about" },
    { id: "contact", path: "/contact" }
] as const
const LINKED_ITEMS = NAV_ITEMS.filter((item) => item.id !== "home")

type Language = (typeof LANGUAGES)[number]

function isDesktop(page: Page) {
    return (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH
}

async function openHome(page: Page, language: Language) {
    await page.goto(language)
    await page.getByRole("heading", { level: 1 }).waitFor()
}

async function openMenuIfCollapsed(page: Page, language: Language) {
    if (isDesktop(page)) {
        return
    }

    const menu = page.getByRole("button", { name: UI_TEXTS[language].menu })
    if ((await menu.getAttribute("aria-expanded")) !== "true") {
        await menu.click()
    }
}

async function getNavigation(page: Page, language: Language) {
    await openMenuIfCollapsed(page, language)
    return page.getByRole("navigation", { name: UI_TEXTS[language].navigationLabel })
}

async function getNavLink(page: Page, language: Language, id: (typeof NAV_ITEMS)[number]["id"]) {
    const navigation = await getNavigation(page, language)
    return navigation.getByRole("link", { name: UI_TEXTS[language].navigation[id], exact: true })
}

test.describe("cabeçalho e navegação", () => {
    for (const language of LANGUAGES) {
        test(`RF-LAY-03, RF-LAY-15, NF-IN-11: a navegação em ${language} tem os quatro itens com o caminho do idioma`, async ({
            page
        }) => {
            await openHome(page, language)

            for (const { id, path } of NAV_ITEMS) {
                await expect(await getNavLink(page, language, id)).toHaveAttribute(
                    "href",
                    `${FATEC_BASE_PATH}${language}${path}`
                )
            }
        })
    }

    test("RF-LAY-04, A11Y-L04: na Início só o item Início tem aria-current e na não encontrada nenhum tem", async ({
        page
    }) => {
        await openHome(page, "pt-BR")

        for (const { id } of NAV_ITEMS) {
            const link = await getNavLink(page, "pt-BR", id)
            if (id === "home") {
                await expect(link).toHaveAttribute("aria-current", "page")
            } else {
                await expect(link).not.toHaveAttribute("aria-current", /.*/)
            }
        }

        await page.goto("pt-BR/rota-inexistente")
        await page.getByRole("heading", { level: 1 }).waitFor()

        for (const { id } of NAV_ITEMS) {
            await expect(await getNavLink(page, "pt-BR", id)).not.toHaveAttribute(
                "aria-current",
                /.*/
            )
        }
    })

    for (const language of LANGUAGES) {
        for (const { id, path } of LINKED_ITEMS) {
            test(`RF-LAY-15, RF-LAY-32: clicar em ${id} em ${language} mantém o idioma, foca o h1 e troca o título`, async ({
                page
            }) => {
                await openHome(page, language)

                await (await getNavLink(page, language, id)).click()

                await expect(page).toHaveURL(new RegExp(`/${language}${path}$`))
                const heading = page.getByRole("heading", { level: 1 })
                const isProjects = id === "projects"
                await expect(heading).toHaveText(
                    isProjects
                        ? UI_TEXTS[language].projects.heading
                        : UI_TEXTS[language].notFoundHeading
                )
                await expect(heading).toBeFocused()
                await expect(page).toHaveTitle(
                    isProjects
                        ? UI_TEXTS[language].projects.title
                        : UI_TEXTS[language].notFoundTitle
                )
            })
        }
    }

    test("RF-LAY-02, RF-LAY-15: o logo volta à Início do idioma atual", async ({ page }) => {
        await page.goto("es/rota-inexistente")
        await page.getByRole("heading", { level: 1, name: "Página no encontrada" }).waitFor()

        await page.getByRole("link", { name: "Luiz Felipe dos Santos", exact: true }).click()

        await expect(page).toHaveURL(/\/es$/)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(UI_TEXTS.es.homeHeading)
    })

    test("RF-LAY-32: Voltar e Avançar do navegador restauram a rota com o idioma e o aria-current", async ({
        page
    }) => {
        await openHome(page, "pt-BR")
        await (await getNavLink(page, "pt-BR", "projects")).click()
        await expect(page).toHaveURL(/\/pt-BR\/projects$/)

        await page.goBack()

        await expect(page).toHaveURL(/\/pt-BR$/)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            UI_TEXTS["pt-BR"].homeHeading
        )
        await expect(await getNavLink(page, "pt-BR", "home")).toHaveAttribute(
            "aria-current",
            "page"
        )

        await page.goForward()

        await expect(page).toHaveURL(/\/pt-BR\/projects$/)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            UI_TEXTS["pt-BR"].projects.heading
        )
    })

    test("RF-LAY-05: abaixo de 640px só o botão Menu aparece e a partir de 640px só a navegação completa", async ({
        page
    }) => {
        await page.setViewportSize({ width: BELOW_DESKTOP_WIDTH, height: VIEWPORT_HEIGHT })
        await openHome(page, "pt-BR")
        const navigation = page.getByRole("navigation", { name: "Principal" })
        const menu = page.getByRole("button", { name: "Menu" })

        await expect(menu).toBeVisible()
        await expect(navigation).toHaveCount(0)

        await page.setViewportSize({ width: DESKTOP_MIN_WIDTH, height: VIEWPORT_HEIGHT })

        await expect(navigation).toBeVisible()
        await expect(menu).toHaveCount(0)
    })
})

test.describe("menu mobile", () => {
    test.beforeEach(async ({ page }) => {
        test.skip(isDesktop(page), "o menu mobile existe só abaixo de 640px")
        await openHome(page, "pt-BR")
    })

    test("RF-LAY-06, RF-LAY-08: o botão Menu abre o painel, o clique num link navega com o idioma e fecha o painel", async ({
        page
    }) => {
        const menu = page.getByRole("button", { name: "Menu" })
        await menu.click()
        await expect(menu).toHaveAttribute("aria-expanded", "true")

        await (await getNavLink(page, "pt-BR", "about")).click()

        await expect(page).toHaveURL(/\/pt-BR\/about$/)
        await expect(menu).toHaveAttribute("aria-expanded", "false")
        await expect(page.getByRole("navigation", { name: "Principal" })).toHaveCount(0)
    })

    test("RF-LAY-08: voltar do navegador com o menu aberto fecha o painel", async ({ page }) => {
        await (await getNavLink(page, "pt-BR", "projects")).click()
        await expect(page).toHaveURL(/\/pt-BR\/projects$/)
        const menu = page.getByRole("button", { name: "Menu" })
        await menu.click()
        await expect(menu).toHaveAttribute("aria-expanded", "true")

        await page.goBack()

        await expect(page).toHaveURL(/\/pt-BR$/)
        await expect(menu).toHaveAttribute("aria-expanded", "false")
    })

    test("RF-LAY-08: trocar o tema ou o idioma dentro do painel não o fecha", async ({ page }) => {
        const menu = page.getByRole("button", { name: "Menu" })
        await menu.click()

        await page.getByRole("button", { name: "Tema escuro" }).click()
        await expect(menu).toHaveAttribute("aria-expanded", "true")

        await page.getByRole("button", { name: "Idioma: Português" }).click()
        await page.getByRole("link", { name: "English", exact: true }).click()
        await expect(page).toHaveURL(/\/en$/)
        await expect(menu).toHaveAttribute("aria-expanded", "true")
    })

    test("RF-LAY-08: ao alargar a janela para 640px o painel fecha", async ({ page }) => {
        const menu = page.getByRole("button", { name: "Menu" })
        await menu.click()
        await expect(menu).toHaveAttribute("aria-expanded", "true")
        const panelId = (await menu.getAttribute("aria-controls")) ?? ""
        expect(panelId).not.toBe("")

        await page.setViewportSize({ width: DESKTOP_MIN_WIDTH, height: VIEWPORT_HEIGHT })

        await expect(page.locator(`[id="${panelId}"]`)).toBeHidden()
        await expect(page.getByRole("navigation", { name: "Principal" })).toBeVisible()

        await page.setViewportSize({ width: MOBILE_WIDTH, height: VIEWPORT_HEIGHT })

        await expect(menu).toHaveAttribute("aria-expanded", "false")
        await expect(page.locator(`[id="${panelId}"]`)).toBeHidden()
    })
})
