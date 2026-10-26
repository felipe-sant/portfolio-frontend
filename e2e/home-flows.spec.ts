import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import readFeaturedProjects from "./support/readFeaturedProjects"
import UI_TEXTS from "./support/uiTexts"

const LANGUAGES = ["pt-BR", "en", "es"] as const

type Language = (typeof LANGUAGES)[number]

async function openHome(page: Page, language: Language) {
    await page.goto(language)
    await page.getByRole("heading", { level: 1 }).waitFor()
    await page.getByRole("article").first().waitFor()
}

async function expectNotFoundIn(page: Page, language: Language, path: string) {
    await expect(page).toHaveURL(new RegExp(`/${language}${path}$`))
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        UI_TEXTS[language].notFoundHeading
    )
}

async function expectProjectsIn(page: Page, language: Language) {
    await expect(page).toHaveURL(new RegExp(`/${language}/projects$`))
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
        UI_TEXTS[language].projects.heading
    )
}

for (const language of LANGUAGES) {
    const texts = UI_TEXTS[language]

    test.describe(`saídas da Início em ${language}`, () => {
        test.beforeEach(async ({ page }) => {
            await openHome(page, language)
        })

        test("RF-HOME-06, RF-HOME-25: o botão principal do topo leva à lista de projetos do idioma", async ({
            page
        }) => {
            const link = page.getByRole("link", { name: texts.heroViewProjects })

            await expect(link).toHaveAttribute("href", `${FATEC_BASE_PATH}${language}/projects`)
            await link.click()

            await expectProjectsIn(page, language)
        })

        test("RF-HOME-22, RF-HOME-25: Ler sobre mim leva à tela sobre do idioma", async ({
            page
        }) => {
            const link = page.getByRole("link", { name: texts.exitAbout })

            await expect(link).toHaveAttribute("href", `${FATEC_BASE_PATH}${language}/about`)
            await link.click()

            await expectNotFoundIn(page, language, "/about")
        })

        test("RF-HOME-22, RF-HOME-25: a saída final Ver todos os projetos leva à lista do idioma", async ({
            page
        }) => {
            const links = page.getByRole("link", { name: texts.exitAllProjects })
            await expect(links).toHaveCount(2)
            const exit = links.last()

            await expect(exit).toHaveAttribute("href", `${FATEC_BASE_PATH}${language}/projects`)
            await exit.click()

            await expectProjectsIn(page, language)
        })

        test("RF-HOME-16, RF-HOME-25: o Ver todos do cabeçalho da seção leva à lista do idioma", async ({
            page
        }) => {
            const link = page.getByRole("link", { name: texts.featuredViewAll }).first()

            await expect(link).toHaveAttribute("href", `${FATEC_BASE_PATH}${language}/projects`)
            await link.click()

            await expectProjectsIn(page, language)
        })

        test("RF-HOME-17, RF-HOME-19, RF-HOME-25: os destaques seguem a ordem do conteúdo e o título de cada um leva ao projeto", async ({
            page
        }) => {
            const featured = readFeaturedProjects(language)
            expect(featured.length).toBeGreaterThan(0)
            const articles = page.getByRole("article")

            await expect(articles).toHaveCount(featured.length)
            for (const [index, project] of featured.entries()) {
                const link = articles.nth(index).getByRole("link")
                await expect(link).toHaveText(project.title)
                await expect(link).toHaveAttribute(
                    "href",
                    `${FATEC_BASE_PATH}${language}/projects/${project.id}`
                )
            }

            await articles.first().getByRole("link").click()

            await expectNotFoundIn(page, language, `/projects/${featured[0].id}`)
        })

        test("RF-HOME-19, NF-MO-01, A11Y-G12: com movimento reduzido o hover não desloca o destaque", async ({
            page
        }) => {
            const article = page.getByRole("article").first()

            await article.hover()

            const transforms = await article.evaluate((element) =>
                [element, ...element.querySelectorAll("*")].map(
                    (node) => getComputedStyle(node).transform
                )
            )
            expect(transforms.every((transform) => transform === "none")).toBe(true)
        })

        test("RF-HOME-07: Baixar CV aponta para o PDF do idioma e não é um download direto", async ({
            page
        }) => {
            const link = page.getByRole("link", { name: texts.resumePdf })

            await expect(link).toHaveAttribute("href", `${FATEC_BASE_PATH}cv/cv-${language}.pdf`)
            await expect(link).not.toHaveAttribute("download", /.*/)
        })

        test("RF-HOME-08, RF-HOME-09, RF-HOME-10: o bloco do que faço agora tem o título e o cartão de trabalho ou estudo do idioma", async ({
            page
        }) => {
            await expect(
                page.getByRole("heading", { level: 2, name: texts.statusHeading })
            ).toBeAttached()
            const card = page
                .getByText(texts.statusWorking, { exact: true })
                .or(page.getByText(texts.statusStudying, { exact: true }))

            await expect(card.first()).toBeVisible()
        })
    })
}

const ENGLISH = UI_TEXTS.en
const DESKTOP_MIN_WIDTH = 640

function isDesktop(page: Page) {
    return (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH
}

async function switchToEnglish(page: Page) {
    if (!isDesktop(page)) {
        await page.getByRole("button", { name: UI_TEXTS["pt-BR"].menu }).click()
    }
    await page.getByRole("button", { name: "Idioma: Português" }).click()
    await page.getByRole("link", { name: "English", exact: true }).click()
    await expect(page).toHaveURL(/\/en$/)
    if (!isDesktop(page)) {
        await page.keyboard.press("Escape")
    }
}

async function openHomeThenSwitch(
    page: Page,
    blockedFile: string,
    handler?: Parameters<Page["route"]>[1]
) {
    await page.route(`**/content/en/${blockedFile}.json`, handler ?? ((route) => route.abort()))
    await openHome(page, "pt-BR")
    await switchToEnglish(page)
}

async function openHomeFromNotFound(
    page: Page,
    blockedFile: string,
    handler?: Parameters<Page["route"]>[1]
) {
    const texts = UI_TEXTS["pt-BR"]
    await page.route(`**/content/pt-BR/${blockedFile}.json`, handler ?? ((route) => route.abort()))
    await page.goto("pt-BR/rota-inexistente")
    await page.getByRole("heading", { level: 1, name: texts.notFoundHeading }).waitFor()
    if (!isDesktop(page)) {
        await page.getByRole("button", { name: texts.menu }).click()
    }
    await page
        .getByRole("navigation", { name: texts.navigationLabel })
        .getByRole("link", { name: texts.navigation.home, exact: true })
        .click()
    await expect(page).toHaveURL(/\/pt-BR$/)
}

function getAlert(page: Page, title: string) {
    return page.getByRole("alert").filter({ hasText: title })
}

test.describe("carregando e erro da Início", () => {
    test("RF-HOME-24, A11Y-G14: com os projetos falhando o bloco mostra o alerta com o botão de tentar de novo e mantém o título", async ({
        page
    }) => {
        await openHomeThenSwitch(page, "projects")

        const alert = getAlert(page, ENGLISH.featuredError)
        await expect(alert).toBeVisible()
        await expect(alert).toContainText(ENGLISH.loadErrorDescription)
        await expect(alert.getByRole("button", { name: ENGLISH.retry })).toBeVisible()
        await expect(
            page.getByRole("heading", { level: 2, name: ENGLISH.featuredHeading })
        ).toBeVisible()
    })

    test("RF-HOME-24: Tentar novamente refaz só os projetos sem recarregar e devolve o foco ao título do bloco", async ({
        page
    }) => {
        await openHomeThenSwitch(page, "projects")
        await expect(getAlert(page, ENGLISH.featuredError)).toBeVisible()
        await page.evaluate(() => Reflect.set(window, "e2eMarker", true))
        await page.unroute("**/content/en/projects.json")

        await getAlert(page, ENGLISH.featuredError)
            .getByRole("button", { name: ENGLISH.retry })
            .click()

        await expect(page.getByRole("article").first()).toBeVisible()
        await expect(getAlert(page, ENGLISH.featuredError)).toHaveCount(0)
        await expect(
            page.getByRole("heading", { level: 2, name: ENGLISH.featuredHeading })
        ).toBeFocused()
        expect(await page.evaluate(() => Reflect.get(window, "e2eMarker"))).toBe(true)
    })

    test("RF-HOME-24, A11Y-G14: com a trajetória falhando o bloco mostra o alerta e o retry devolve o foco ao título do bloco", async ({
        page
    }) => {
        await openHomeThenSwitch(page, "timeline")
        const alert = getAlert(page, ENGLISH.statusError)
        await expect(alert).toBeVisible()
        await expect(alert.getByRole("button", { name: ENGLISH.retry })).toBeVisible()
        await page.unroute("**/content/en/timeline.json")

        await alert.getByRole("button", { name: ENGLISH.retry }).click()

        await expect(getAlert(page, ENGLISH.statusError)).toHaveCount(0)
        await expect(
            page
                .getByText(ENGLISH.statusWorking, { exact: true })
                .or(page.getByText(ENGLISH.statusStudying, { exact: true }))
                .first()
        ).toBeVisible()
        await expect(
            page.getByRole("heading", { level: 2, name: ENGLISH.statusHeading })
        ).toBeFocused()
    })

    test("RF-HOME-24: com o perfil falhando o bloco do perfil some sem mensagem e a página não mostra erro técnico", async ({
        page
    }) => {
        await openHomeFromNotFound(page, "profile")

        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            UI_TEXTS["pt-BR"].homeHeading
        )
        await expect(
            page.getByRole("link", { name: UI_TEXTS["pt-BR"].heroViewProjects })
        ).toBeVisible()
        await expect(
            page.getByRole("region", { name: UI_TEXTS["pt-BR"].stackHeading })
        ).toHaveCount(0)
        await expect(page.getByRole("alert")).toHaveCount(0)
        await expect(page.getByRole("main")).not.toContainText(/error|erro|failed|fetch|undefined/i)
    })

    test("RF-HOME-23, A11Y-G13: com a resposta dos projetos retida existe um único status Carregando com o esqueleto escondido e, ao liberar, ambos somem", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"]
        const gate = Promise.withResolvers<void>()
        await openHomeFromNotFound(page, "projects", async (route) => {
            await gate.promise
            await route.continue()
        })
        const featuredSection = page.locator("section[aria-labelledby]", {
            has: page.getByRole("heading", { level: 2, name: texts.featuredHeading })
        })
        const loading = page.getByRole("status").filter({ hasText: texts.loading })

        await expect(loading).toHaveCount(1)
        await expect(
            featuredSection.locator("span[aria-hidden='true']:empty").first()
        ).toBeAttached()
        await expect(page.getByRole("article")).toHaveCount(0)

        gate.resolve()

        await expect(page.getByRole("article").first()).toBeVisible()
        await expect(loading).toHaveCount(0)
        await expect(featuredSection.locator("span[aria-hidden='true']:empty")).toHaveCount(0)
    })

    test("RF-HOME-23: com a trajetória falhando os destaques, a faixa de tecnologias e o topo aparecem", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"]
        await openHomeFromNotFound(page, "timeline")

        await expect(getAlert(page, texts.statusError)).toBeVisible()
        await expect(page.getByRole("article").first()).toBeVisible()
        await expect(page.getByRole("region", { name: texts.stackHeading })).toBeVisible()
        await expect(page.getByRole("link", { name: texts.heroViewProjects })).toBeVisible()
        await expect(getAlert(page, texts.featuredError)).toHaveCount(0)
    })
})
