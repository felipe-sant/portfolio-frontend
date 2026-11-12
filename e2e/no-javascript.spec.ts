import { readFileSync } from "node:fs"
import { expect, test } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import FATEC_SITE_URL from "@scripts/fatecSiteUrl"
import PROJECT_TEXTS from "./support/projectTexts"
import projectPath from "./support/projectPath"
import readFeaturedProjects from "./support/readFeaturedProjects"
import readProfile from "./support/readProfile"
import readProjects from "./support/readProjects"
import readAbout from "./support/readAbout"
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

        test(`NF-CO-03, NF-IA-01, RF-HOME-17, RF-HOME-26, RF-HOME-27: a Início em ${language} traz o título, a linha da stack, a apresentação e os destaques do conteúdo`, async ({
            page
        }) => {
            const profile = readProfile(language)
            const featured = readFeaturedProjects(language)
            expect(featured.length).toBeGreaterThan(0)

            await page.goto(language)

            await expect(page.getByRole("heading", { level: 1 })).toHaveText(texts.homeHeading)
            await expect(
                page.getByRole("main").getByText(texts.homeStack, { exact: true })
            ).toBeVisible()
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
                ).toHaveCount(1)
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

test.describe("sem JavaScript, projetos", () => {
    test.use({ javaScriptEnabled: false })

    for (const language of LANGUAGES) {
        const texts = UI_TEXTS[language].projects

        test(`RF-PROJECTS-32, NF-CO-03, NF-IA-07: em ${language} /projects traz o h2 da seção e os cards experimentais com links funcionando no HTML`, async ({
            page
        }) => {
            const experiments = readProjects(language).filter((project) => project.experiment)
            expect(experiments.length).toBe(2)

            const response = await page.goto(`${language}/projects`)

            expect(response?.status()).toBe(200)
            const main = page.getByRole("main")
            await expect(
                main.getByRole("heading", { level: 2, name: texts.experimentsHeading })
            ).toBeVisible()
            await expect(main.getByText(texts.experimentsDescription)).toBeVisible()
            const links = main.getByRole("heading", { level: 3 }).getByRole("link")
            await expect(links).toHaveCount(experiments.length)
            for (const project of experiments) {
                await expect(
                    links.and(page.locator(`a[href$="/${language}/projects/${project.id}"]`))
                ).toHaveText(project.title)
            }
        })
    }
})

test.describe("sem JavaScript, informações", () => {
    test.use({ javaScriptEnabled: false })

    for (const language of LANGUAGES) {
        const texts = UI_TEXTS[language].aboutPage

        test(`RF-ABOUT-30, RF-ABOUT-23, NF-CO-03, NF-IA-07: em ${language} /about traz as seções e o detalhe de cada item no HTML, sem abrir o modal`, async ({
            page
        }) => {
            const about = readAbout(language)
            expect(about.entries.length).toBeGreaterThan(0)

            const response = await page.goto(`${language}/about`)

            expect(response?.status()).toBe(200)
            await expect(page.locator("html")).toHaveAttribute("lang", language)
            await expect(page).toHaveTitle(texts.title)
            await expect(page.locator('meta[name="description"]')).toHaveAttribute(
                "content",
                texts.description
            )
            const main = page.getByRole("main")
            await expect(main.getByRole("heading", { level: 1 })).toHaveText(texts.heading)
            await expect(main.getByText(about.summary, { exact: true })).toBeVisible()
            await expect(main.getByRole("heading", { level: 2 })).toHaveText([
                texts.aboutMe,
                texts.trajectory,
                texts.stack,
                texts.certificates,
                texts.workStyle
            ])
            for (const paragraph of about.aboutParagraphs) {
                await expect(main.getByText(paragraph, { exact: true })).toBeVisible()
            }
            await expect(main.getByRole("group", { name: texts.nowHeading })).toBeVisible()
            for (const principle of about.workPrinciples) {
                await expect(main.getByText(principle, { exact: true })).toBeVisible()
            }
            for (const entry of about.entries) {
                await expect(main.getByRole("button", { name: entry.highlight })).toBeVisible()
                await expect(main.getByText(entry.summary, { exact: true })).toBeHidden()
                await expect(main.getByText(entry.summary, { exact: true })).toHaveCount(1)
            }
        })

        test(`RF-ABOUT-05, RF-ABOUT-06, NF-CO-03: em ${language} Baixar CV abre o PDF do idioma e Entrar em contato funciona`, async ({
            page
        }) => {
            await page.goto(`${language}/about`)

            const resume = page.getByRole("link", { name: texts.resumeName })
            await expect(resume).toHaveAttribute("href", `${FATEC_BASE_PATH}cv/cv-${language}.pdf`)
            const pdf = await page.request.get((await resume.getAttribute("href")) ?? "")
            expect(pdf.status()).toBe(200)
            expect(pdf.headers()["content-type"]).toBe("application/pdf")
            await page
                .getByRole("main")
                .getByRole("link", { name: UI_TEXTS[language].contactCta })
                .click()
            await expect(page).toHaveURL(new RegExp(`/${language}/contact$`))
        })

        test(`RF-ABOUT-20, NF-CO-03: em ${language} clicar num item não abre o modal`, async ({
            page
        }) => {
            const about = readAbout(language)
            await page.goto(`${language}/about`)

            await page.getByRole("button", { name: about.entries[0].highlight }).click()

            await expect(page.getByRole("dialog")).toHaveCount(0)
            await expect(page.getByText(about.entries[0].summary, { exact: true })).toBeHidden()
        })
    }
})

test.describe("sem JavaScript e com movimento reduzido", () => {
    test.use({ javaScriptEnabled: false, reducedMotion: "reduce" })

    for (const language of LANGUAGES) {
        test(`NF-CO-03, RF-HOME-12: a faixa em ${language} mostra a lista uma vez`, async ({
            page
        }) => {
            await page.goto(language)
            const band = page.getByRole("region", { name: UI_TEXTS[language].stackHeading })

            await expect(band.locator("ul[aria-hidden='true']")).toBeHidden()
            await expect(band.locator("ul:not([aria-hidden='true'])")).toBeVisible()
        })
    }
})

test.describe("sem JavaScript, com toque e movimento pleno", () => {
    test.use({
        javaScriptEnabled: false,
        hasTouch: true,
        isMobile: true,
        reducedMotion: "no-preference"
    })

    test("RF-HOME-13: a faixa anda por CSS com a lista lida uma vez", async ({ page }) => {
        const profile = readProfile("pt-BR")

        await page.goto("pt-BR")
        const band = page.getByRole("region", { name: UI_TEXTS["pt-BR"].stackHeading })

        await expect(band.locator("ul[aria-hidden='true']")).toBeVisible()
        await expect(band.locator("div").first()).not.toHaveCSS("animation-name", "none")
        await expect(band.getByRole("listitem")).toHaveText(profile.stack)
    })
})

test.describe("sem JavaScript, raiz", () => {
    test.use({ javaScriptEnabled: false })

    const ROOT_LINKS = [
        { language: "pt-BR", text: "Ver o portfólio em português" },
        { language: "en", text: "View the portfolio in English" },
        { language: "es", text: "Ver el portafolio en español" }
    ] as const
    const ROOT_URL = `${FATEC_SITE_URL}${FATEC_BASE_PATH}`
    const homeMeta: { meta: { title: string; description: string } } = JSON.parse(
        readFileSync("src/locales/en/home.json", "utf-8")
    )

    test("NF-IA-22, NF-IA-04, NF-IN-05: a raiz responde 200 com lang en, h1 e três links por idioma", async ({
        page
    }) => {
        const response = await page.goto("")

        expect(response?.status()).toBe(200)
        await expect(page.locator("html")).toHaveAttribute("lang", "en")
        await expect(page.getByRole("heading", { level: 1 })).toHaveText("Luiz Felipe dos Santos")
        const links = page.getByRole("navigation", { name: "Language" }).getByRole("link")
        await expect(links).toHaveCount(ROOT_LINKS.length)

        for (const { language, text } of ROOT_LINKS) {
            const link = page.getByRole("link", { name: text })

            await expect(link).toHaveAttribute("href", `${FATEC_BASE_PATH}${language}`)
            await expect(link).toHaveAttribute("hreflang", language)
            await expect(link).toHaveAttribute("lang", language)
        }
    })

    test("NF-IA-22, NF-IA-11: a raiz tem canonical para o en e hreflang absolutos com o base", async ({
        page
    }) => {
        await page.goto("")

        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${ROOT_URL}en`)

        for (const hreflang of ["pt-BR", "en", "es", "x-default"]) {
            const expected = `${ROOT_URL}${hreflang === "x-default" ? "en" : hreflang}`

            await expect(
                page.locator(`link[rel="alternate"][hreflang="${hreflang}"]`)
            ).toHaveAttribute("href", expected)
        }
    })

    test("NF-IA-22, NF-IA-10: a raiz tem título, descrição e og do en", async ({ page }) => {
        await page.goto("")

        await expect(page).toHaveTitle(homeMeta.meta.title)
        await expect(page.locator('meta[name="description"]')).toHaveAttribute(
            "content",
            homeMeta.meta.description
        )
        await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
            "content",
            homeMeta.meta.title
        )
        await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
            "content",
            homeMeta.meta.description
        )
        await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "website")
        await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
            "content",
            `${ROOT_URL}en`
        )
        await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
            "content",
            `${ROOT_URL}images/og-site.png`
        )
    })

    for (const { language, text } of ROOT_LINKS) {
        test(`NF-IA-22: o link em ${language} leva a /${language} com 200`, async ({ page }) => {
            await page.goto("")
            const target = await page.getByRole("link", { name: text }).getAttribute("href")

            const response = await page.goto(target ?? "")

            expect(response?.status()).toBe(200)
            expect(new URL(page.url()).pathname).toBe(`${FATEC_BASE_PATH}${language}`)
        })
    }

    test("NF-IA-22: o 404.html não herda hreflang nem o noscript da raiz", async ({ page }) => {
        await page.goto(NOT_FOUND_ROUTE)

        await expect(page.locator("link[hreflang]")).toHaveCount(0)
        await expect(page.locator("noscript[data-root]")).toHaveCount(0)
    })
})
