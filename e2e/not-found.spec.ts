import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import UI_TEXTS from "./support/uiTexts"

const DESKTOP_MIN_WIDTH = 640
const LANGUAGES = ["pt-BR", "en", "es"] as const
const HOME_CHUNK = "**/assets/Home.page-*.js"
const TECHNICAL_MESSAGE = /failed to fetch|loading chunk|dynamically imported|typeerror|error:/i

function isDesktop(page: Page) {
    return (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH
}

async function clickHomeInNavigation(page: Page) {
    const texts = UI_TEXTS["pt-BR"]
    if (!isDesktop(page)) {
        await page.getByRole("button", { name: texts.menu }).click()
    }
    await page
        .getByRole("navigation", { name: texts.navigationLabel })
        .getByRole("link", { name: texts.navigation.home, exact: true })
        .click()
}

async function openErrorPage(page: Page) {
    await page.route(HOME_CHUNK, (route) => route.abort())
    await page.goto("pt-BR/rota-inexistente")
    await page.getByRole("heading", { level: 1, name: UI_TEXTS["pt-BR"].notFoundHeading }).waitFor()
    await clickHomeInNavigation(page)
    await expect(
        page.getByRole("heading", { level: 1, name: UI_TEXTS["pt-BR"].errorHeading })
    ).toBeVisible()
}

test.describe("página não encontrada", () => {
    for (const language of LANGUAGES) {
        const texts = UI_TEXTS[language]

        test(`RF-LAY-28, NF-IN-01: em ${language} a não encontrada tem título, rótulo e descrição do idioma dentro do layout`, async ({
            page
        }) => {
            await page.goto(`${language}/x`)

            await expect(page.getByRole("heading", { level: 1 })).toHaveText(texts.notFoundHeading)
            await expect(page.getByRole("main")).toContainText(texts.notFoundLabel)
            await expect(page.getByRole("main")).toContainText(texts.notFoundDescription)
            await expect(page.getByRole("banner")).toBeVisible()
            await expect(page.getByRole("contentinfo")).toBeVisible()
            await expect(page.locator("html")).toHaveAttribute("lang", language)
        })

        test(`RF-LAY-28, RF-LAY-15: em ${language} Voltar para o início leva à Início do idioma e Ver projetos aponta para a lista`, async ({
            page
        }) => {
            await page.goto(`${language}/x`)
            const main = page.getByRole("main")

            await expect(
                main.getByRole("link", { name: texts.notFoundViewProjects })
            ).toHaveAttribute("href", `${FATEC_BASE_PATH}${language}/projects`)
            await main.getByRole("link", { name: texts.backHome }).click()

            await expect(page).toHaveURL(new RegExp(`/${language}$`))
            await expect(page.getByRole("heading", { level: 1 })).toHaveText(texts.homeHeading)
        })
    }

    test("RF-LAY-28: a página tem a meta robots noindex", async ({ page }) => {
        await page.goto("pt-BR/x")
        await page.getByRole("heading", { level: 1 }).waitFor()

        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex")
    })

    for (const path of ["fr/x", "x"]) {
        test(`RF-LAY-28, NF-IN-06: o caminho ${path} mostra a não encontrada em inglês`, async ({
            page
        }) => {
            await page.goto(path)

            await expect(page.getByRole("heading", { level: 1 })).toHaveText(
                UI_TEXTS.en.notFoundHeading
            )
            await expect(page.locator("html")).toHaveAttribute("lang", "en")
        })
    }
})

test.describe("página de erro", () => {
    test("RF-LAY-29, A11Y-ER01, A11Y-ER02: com o chunk da Início indisponível a navegação mostra a página de erro com os próprios landmarks, pular, tentar de novo, voltar e noindex", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"]
        await openErrorPage(page)

        await expect(page.getByRole("banner")).toHaveCount(1)
        await expect(page.getByRole("main")).toHaveCount(1)
        await expect(page.getByRole("contentinfo")).toHaveCount(1)
        await expect(page.getByRole("link", { name: texts.skipToContent })).toBeAttached()
        await expect(
            page.getByRole("main").getByRole("button", { name: texts.errorRetry })
        ).toBeVisible()
        await expect(
            page.getByRole("main").getByRole("link", { name: texts.backHome })
        ).toHaveAttribute("href", `${FATEC_BASE_PATH}pt-BR`)
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex")
        await expect(page).toHaveTitle(texts.errorTitle)
    })

    test("RF-LAY-30: a página de erro não mostra mensagem técnica", async ({ page }) => {
        await openErrorPage(page)

        await expect(page.getByRole("main")).toContainText(UI_TEXTS["pt-BR"].errorDescription)
        await expect(page.getByRole("main")).not.toContainText(TECHNICAL_MESSAGE)
    })

    test("RF-LAY-29: Tentar novamente com o chunk liberado recarrega a rota e a Início volta", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"]
        await openErrorPage(page)
        await page.unroute(HOME_CHUNK)

        await page.getByRole("main").getByRole("button", { name: texts.errorRetry }).click()

        await expect(page.getByRole("heading", { level: 1 })).toHaveText(texts.homeHeading)
        await expect(page).toHaveURL(/\/pt-BR$/)
    })
})
