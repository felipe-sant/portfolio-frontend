import { expect, test } from "@playwright/test"
import PROJECT_TEXTS from "./support/projectTexts"
import projectPath from "./support/projectPath"
import readFeaturedProjects from "./support/readFeaturedProjects"
import readProfile from "./support/readProfile"
import readProjectDetail from "./support/readProjectDetail"
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

test.describe("sem JavaScript, projeto", () => {
    test.use({ javaScriptEnabled: false })

    for (const language of LANGUAGES) {
        const texts = PROJECT_TEXTS[language]

        for (const documentName of [undefined, "SETUP.md", "LICENSE"]) {
            test(`RF-PROJECT-35, NF-CO-03, NF-IA-01, NF-IA-02: em ${language} o projeto${documentName ? ` com ${documentName}` : ""} traz cabeçalho, ficha, stack, links, nav, documento e relacionados no HTML`, async ({
                page
            }) => {
                const project = readProjectDetail(language, "MNIST Classifier")

                const response = await page.goto(projectPath(language, project.id, documentName))

                expect(response?.status()).toBe(200)
                await expect(page.locator("html")).toHaveAttribute("lang", language)
                await expect(page).toHaveTitle(
                    documentName
                        ? texts.documentTitle(documentName, project.title)
                        : texts.title(project.title)
                )
                const main = page.getByRole("main")
                await expect(main.getByRole("heading", { level: 1 })).toHaveText(project.title)
                await expect(main.getByText(project.summary)).toBeVisible()
                await expect(
                    main.getByRole("heading", { level: 2, name: texts.factsHeading })
                ).toBeVisible()
                await expect(
                    main.getByRole("heading", { level: 2, name: texts.stackHeading })
                ).toBeVisible()
                await expect(
                    main.getByRole("link", { name: texts.codeName(project.title) })
                ).toBeVisible()
                await expect(main.getByRole("img", { name: project.images[0].alt })).toBeVisible()
                const nav = main.getByRole("navigation", { name: texts.documentsLabel })
                await expect(nav.getByRole("link")).toHaveCount(project.documents.length)
                await expect(nav.getByRole("link").nth(1)).toHaveAttribute(
                    "href",
                    new RegExp(`/${language}/projects/${project.id}/docs/ARCHITECTURE\\.md$`)
                )
                await expect(
                    main.getByRole("heading", { level: 2, name: documentName ?? "README.md" })
                ).toBeVisible()
                await expect(
                    main.getByRole("heading", { level: 2, name: texts.relatedHeading })
                ).toBeVisible()
                if (documentName === "LICENSE") {
                    await expect(main.getByRole("region", { name: "LICENSE" })).toContainText(
                        "MIT License"
                    )
                } else {
                    await expect(main.getByRole("heading", { level: 3 }).first()).toBeVisible()
                }
            })
        }
    }

    test("NF-IA-04, RF-PROJECT-34: id inexistente e documento inexistente respondem 404 com a não encontrada", async ({
        page
    }) => {
        const project = readProjectDetail("pt-BR", "MNIST Classifier")

        for (const route of [
            "pt-BR/projects/01a131df-93ee-72f3-8c7a-f67501e47a7b",
            projectPath("pt-BR", project.id, "NAO-EXISTE.md")
        ]) {
            const response = await page.goto(route)

            expect(response?.status()).toBe(404)
            await expect(page.getByRole("heading", { level: 1 })).toHaveText(
                UI_TEXTS.en.notFoundHeading
            )
        }
    })
})
