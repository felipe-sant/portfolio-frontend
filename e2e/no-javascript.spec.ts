import { expect, test } from "@playwright/test"
import readFeaturedProjects from "./support/readFeaturedProjects"
import readProfile from "./support/readProfile"
import ROUTES_UNDER_TEST from "./support/routesUnderTest"
import UI_TEXTS from "./support/uiTexts"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const NOT_FOUND_ROUTE = "pt-BR/rota-inexistente"
const PRERENDERED_ROUTES = ROUTES_UNDER_TEST.filter((route) => route !== NOT_FOUND_ROUTE)

test.describe("sem JavaScript", () => {
    test.use({ javaScriptEnabled: false })

    for (const route of PRERENDERED_ROUTES) {
        test(`NF-CO-03, NF-IA-01, NF-IN-05, NF-IA-04: a rota ${route} responde 200 com main e h1 visíveis e o lang do caminho`, async ({
            page
        }) => {
            const response = await page.goto(route)

            expect(response?.status()).toBe(200)
            await expect(page.getByRole("main")).toBeVisible()
            await expect(page.getByRole("heading", { level: 1 })).not.toBeEmpty()
            await expect(page.locator("html")).toHaveAttribute("lang", route.split("/")[0])
        })
    }

    for (const language of LANGUAGES) {
        const texts = UI_TEXTS[language]

        test(`NF-CO-03, NF-IA-01, RF-HOME-17: a Início em ${language} traz o título, a apresentação e os destaques do conteúdo`, async ({
            page
        }) => {
            const profile = readProfile(language)
            const featured = readFeaturedProjects(language)
            expect(featured.length).toBeGreaterThan(0)

            await page.goto(language)

            await expect(page.getByRole("heading", { level: 1 })).toHaveText(texts.homeHeading)
            await expect(page.getByRole("main")).toContainText(profile.homeIntro)
            await expect(
                page.getByRole("heading", { level: 2, name: texts.featuredHeading })
            ).toBeVisible()
            const links = page.getByRole("article").getByRole("link")
            await expect(links).toHaveCount(featured.length)
            await expect(links).toHaveText(featured.map((project) => project.title))
        })

        test(`NF-CO-03, RF-HOME-12: a faixa de tecnologias em ${language} traz os itens da stack em texto`, async ({
            page
        }) => {
            const profile = readProfile(language)
            expect(profile.stack.length).toBeGreaterThan(0)

            await page.goto(language)

            await expect(
                page.getByRole("region", { name: texts.stackHeading }).getByRole("listitem")
            ).toHaveText(profile.stack)
        })

        test(`NF-IA-17: o noscript de ${language} mostra o aviso do idioma e diz que o conteúdo está disponível sem JavaScript`, async ({
            page
        }) => {
            await page.goto(language)

            expect(await page.locator("noscript").innerHTML()).toBe(texts.noscript)
        })
    }

    test("NF-IA-10: o título e a meta description estão no HTML e a description é distinta por idioma", async ({
        page
    }) => {
        const descriptions = new Set<string | null>()

        for (const language of LANGUAGES) {
            await page.goto(language)

            await expect(page).toHaveTitle(UI_TEXTS[language].homeTitle)
            const description = page.locator('meta[name="description"]')
            await expect(description).toHaveAttribute("content", UI_TEXTS[language].homeDescription)
            descriptions.add(await description.getAttribute("content"))
        }

        expect(descriptions.size).toBe(LANGUAGES.length)
    })

    test("NF-IA-04, RF-LAY-28: a rota inexistente responde 404 com a não encontrada em inglês", async ({
        page
    }) => {
        const response = await page.goto(NOT_FOUND_ROUTE)

        expect(response?.status()).toBe(404)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            UI_TEXTS.en.notFoundHeading
        )
        await expect(page.locator("html")).toHaveAttribute("lang", "en")
    })
})
