import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import collectConsoleProblems from "./support/collectConsoleProblems"
import filterProjects from "./support/filterProjects"
import getProjectsView from "./support/getProjectsView"
import holdContent from "./support/holdContent"
import openProjectsFromHeader from "./support/openProjectsFromHeader"
import readProjects from "./support/readProjects"
import serveProjectsFixture from "./support/serveProjectsFixture"
import sortProjects from "./support/sortProjects"
import UI_TEXTS from "./support/uiTexts"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const DESKTOP_MIN_WIDTH = 640
const BATCH = 9
const TOUCH_TARGET = 44
const TYPE_ORDER = [
    "web",
    "mobile",
    "api",
    "desktop",
    "cli",
    "library",
    "extension",
    "bot",
    "data",
    "game",
    "iot",
    "infra"
] as const

type Language = (typeof LANGUAGES)[number]
type Project = ReturnType<typeof readProjects>[number]
type SortName = "recent" | "oldest" | "title"

function isDesktop(page: Page) {
    return (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH
}

async function openProjects(page: Page, language: Language, query = "") {
    await page.goto(`${language}/projects${query}`)
    await page.getByRole("heading", { level: 1 }).waitFor()
}

function loadProjects(language: Language) {
    const projects = readProjects(language)
    expect(projects.length).toBeGreaterThan(0)
    return projects
}

async function expectResults(
    page: Page,
    language: Language,
    matches: Project[],
    sort: SortName = "recent"
) {
    const view = getProjectsView(page, language)
    const ordered = sortProjects(matches, sort, language).slice(0, BATCH)
    await expect(view.status).toHaveText(
        matches.length === 0
            ? view.texts.countNone
            : view.texts.count(ordered.length, matches.length)
    )
    await expect(view.cardLinks).toHaveText(ordered.map((project) => project.title))
}

async function getBox(target: ReturnType<Page["locator"]>) {
    const box = await target.boundingBox()
    if (!box) {
        throw new Error("o alvo não tem caixa na tela")
    }
    return box
}

for (const language of LANGUAGES) {
    test.describe(`estrutura da tela em ${language}`, () => {
        test(`RF-PROJECTS-01, RF-PROJECTS-27, A11Y-G01, A11Y-G02: ${language} traz título, descrição, h1, introdução e os blocos na ordem do documento`, async ({
            page
        }) => {
            const projects = loadProjects(language)
            await openProjects(page, language)
            const view = getProjectsView(page, language)

            await expect(page).toHaveTitle(view.texts.title)
            await expect(page.locator('meta[name="description"]')).toHaveAttribute(
                "content",
                view.texts.description
            )
            await expect(page.locator("html")).toHaveAttribute("lang", language)
            await expect(page.getByRole("main")).toHaveCount(1)
            await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1)
            await expect(view.heading).toHaveText(view.texts.heading)
            await expect(view.main.getByText(view.texts.intro, { exact: true })).toBeVisible()

            const sequence = [
                view.main.getByText(view.texts.intro, { exact: true }),
                view.search,
                view.typeGroup,
                view.categoryGroup,
                view.status,
                view.cards.first()
            ]
            let previousTop = (await getBox(view.heading)).y
            for (const block of sequence) {
                const { y } = await getBox(block)
                expect(y).toBeGreaterThanOrEqual(previousTop)
                previousTop = y
            }
            expect((await getBox(view.cards.first())).y).toBeGreaterThan(
                (await getBox(view.status)).y
            )
            expect((await getBox(view.typeGroup)).y).toBeGreaterThan((await getBox(view.search)).y)
            const searchBox = await getBox(view.search)
            const buttonBox = await getBox(view.filtersButton)
            expect(buttonBox.x).toBeGreaterThanOrEqual(searchBox.x)
            if (isDesktop(page)) {
                expect(buttonBox.x).toBeGreaterThan(searchBox.x + searchBox.width - 1)
            } else {
                expect(buttonBox.y).toBeGreaterThan(searchBox.y)
            }

            const headings = view.main.getByRole("heading")
            await expect(headings).toHaveCount(1 + projects.length)
            await expect(view.main.getByRole("heading", { level: 2 })).toHaveCount(projects.length)
        })

        test(`RF-PROJECTS-14, RF-PROJECTS-15, RF-PROJECTS-16, A11Y-PS06, NF-IN-11: os cards de ${language} seguem o conteúdo, com link do idioma e título como nome`, async ({
            page
        }) => {
            const projects = sortProjects(loadProjects(language), "recent", language).slice(
                0,
                BATCH
            )
            await openProjects(page, language)
            const view = getProjectsView(page, language)

            await expect(view.main.getByRole("list").first().getByRole("article")).toHaveCount(
                projects.length
            )
            await expect(view.cards).toHaveCount(projects.length)
            for (const [index, project] of projects.entries()) {
                const card = view.cards.nth(index)
                const heading = card.getByRole("heading", { level: 2 })
                const link = heading.getByRole("link", { name: project.title, exact: true })

                await expect(link).toHaveAttribute(
                    "href",
                    `${FATEC_BASE_PATH}${language}/projects/${project.id}`
                )
                await expect(link).toHaveText(project.title)
                if (project.featured) {
                    await expect(heading).toContainText(view.texts.featured)
                } else {
                    await expect(heading).not.toContainText(view.texts.featured)
                }
                const time = card.locator("time")
                await expect(time).toHaveText(project.year)
                await expect(time).toHaveAttribute("datetime", project.date)
                const labels = [
                    ...project.types.map(
                        (type) =>
                            view.texts.projectTypes[type as keyof typeof view.texts.projectTypes]
                    ),
                    view.texts.projectCategories[
                        project.category as keyof typeof view.texts.projectCategories
                    ]
                ]
                for (const label of labels) {
                    await expect(card).toContainText(label, { ignoreCase: true })
                }
                await expect(card.locator('[aria-hidden="true"]', { hasText: "·" })).toHaveCount(
                    labels.length - 1
                )
                await expect(card.getByRole("listitem")).toHaveText(project.cardTechnologies)
                await expect(card.getByRole("link")).toHaveCount(1)
            }
        })
    })
}

test.describe("imagens dos cards", () => {
    test("RF-PROJECTS-18, NF-DE-16, NF-DE-17: as imagens reservam o tamanho, as três primeiras não são lazy e as demais são lazy e assíncronas", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const images = getProjectsView(page, "pt-BR").cards.locator("img")
        const total = await images.count()
        expect(total).toBeGreaterThan(3)

        for (let index = 0; index < total; index++) {
            const image = images.nth(index)
            await expect(image).toHaveAttribute("width", /^\d+$/)
            await expect(image).toHaveAttribute("height", /^\d+$/)
            await expect(image).toHaveAttribute("srcset", /.+/)
            await expect(image).toHaveAttribute("sizes", /.+/)
            if (index < 3) {
                await expect(image).not.toHaveAttribute("loading", "lazy")
            } else {
                await expect(image).toHaveAttribute("loading", "lazy")
                await expect(image).toHaveAttribute("decoding", "async")
            }
        }
    })
})

test.describe("busca", () => {
    for (const language of LANGUAGES) {
        test(`RF-PROJECTS-02, A11Y-PS01: o campo de busca de ${language} tem rótulo, placeholder, limite de 100 e 44px, e Limpar busca devolve o foco`, async ({
            page
        }) => {
            const projects = loadProjects(language)
            await openProjects(page, language)
            const view = getProjectsView(page, language)

            await expect(view.search).toHaveAttribute("type", "search")
            await expect(view.search).toHaveAttribute("maxlength", "100")
            await expect(view.search).toHaveAttribute("placeholder", view.texts.searchPlaceholder)
            expect((await getBox(view.search)).height).toBeGreaterThanOrEqual(TOUCH_TARGET)
            const clear = view.main.getByRole("button", { name: view.texts.searchClear })
            await expect(clear).toHaveCount(0)

            await view.search.fill("react")
            await expect(clear).toBeVisible()
            const box = await getBox(clear)
            expect(box.width).toBeGreaterThanOrEqual(TOUCH_TARGET)
            expect(box.height).toBeGreaterThanOrEqual(TOUCH_TARGET)
            await clear.click()

            await expect(view.search).toHaveValue("")
            await expect(view.search).toBeFocused()
            await expect(clear).toHaveCount(0)
            await expectResults(page, language, projects)
            await expect(page).toHaveURL(new RegExp(`/${language}/projects$`))
        })
    }

    test("RF-PROJECTS-03, RF-PROJECTS-04, RF-PROJECTS-23, A11Y-PS04: digitar filtra por título e tecnologia, a contagem está no status e a URL muda por replace", async ({
        page
    }) => {
        const projects = loadProjects("pt-BR")
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        await expect(view.status).toHaveCount(1)
        const historyBefore = await page.evaluate(() => history.length)
        const scrollBefore = await page.evaluate(() => window.scrollY)

        await view.search.pressSequentially("react")

        await expectResults(page, "pt-BR", filterProjects(projects, { q: "react" }))
        await expect(page).toHaveURL(/\/pt-BR\/projects\?q=react$/)
        expect(await page.evaluate(() => history.length)).toBe(historyBefore)
        expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore)

        await view.search.fill("IRRECUSAVEL")
        await expectResults(page, "pt-BR", filterProjects(projects, { q: "irrecusavel" }))
        await expect(view.cards).toHaveCount(1)
        await expect(page).toHaveURL(/\?q=IRRECUSAVEL$/)

        await view.search.fill("")
        await expectResults(page, "pt-BR", projects)
        await expect(page).toHaveURL(/\/pt-BR\/projects$/)
    })

    test("RF-PROJECTS-20, RF-PROJECTS-11: sem resultado mostra o bloco com o termo como texto e Limpar filtros devolve o foco à busca", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")

        await view.search.fill("blockchain")

        await expect(view.status).toHaveText(view.texts.countNone)
        await expect(
            view.main.getByRole("heading", { level: 2, name: view.texts.noResultsHeading })
        ).toBeVisible()
        await expect(view.main).toContainText(view.texts.noResultsWithSearch("blockchain"))
        await expect(view.cards).toHaveCount(0)
        await expect(view.loadMore).toHaveCount(0)
        await expect(view.clearFilters).toHaveCount(1)

        await view.clearFilters.click()

        await expect(view.search).toBeFocused()
        await expect(view.search).toHaveValue("")
        await expect(view.clearFilters).toHaveCount(0)
        await expect(page).toHaveURL(/\/pt-BR\/projects$/)
        await expectResults(page, "pt-BR", loadProjects("pt-BR"))
    })

    test("RF-PROJECTS-20: o termo da busca aparece como texto, nunca como HTML", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")

        await view.search.fill("<b>negrito</b>")

        await expect(view.main).toContainText(view.texts.noResultsWithSearch("<b>negrito</b>"))
        await expect(view.main.locator("b")).toHaveCount(0)
    })

    test("RF-PROJECTS-20: o bloco de sem resultado sem termo diz que nenhuma combinação de filtros serve", async ({
        page
    }) => {
        await openProjects(page, "pt-BR", "?type=cli")
        const view = getProjectsView(page, "pt-BR")

        await expect(view.status).toHaveText(view.texts.countNone)
        await expect(view.main).toContainText(view.texts.noResultsWithoutSearch)
    })
})

test.describe("filtros de tipo e categoria", () => {
    for (const language of LANGUAGES) {
        test(`RF-PROJECTS-05, RF-PROJECTS-06, RF-PROJECTS-07, RF-PROJECTS-11, A11Y-PS02: os grupos de ${language} escolhem, combinam, desmarcam e limpam`, async ({
            page
        }) => {
            const projects = loadProjects(language)
            await openProjects(page, language)
            const view = getProjectsView(page, language)
            const present = TYPE_ORDER.filter((type) =>
                projects.some((project) => project.types.includes(type))
            )
            const typeButtons = view.typeGroup.getByRole("button")
            await expect(typeButtons).toHaveText([
                view.texts.typeAll,
                ...present.map((type) => view.texts.projectTypes[type])
            ])
            await expect(
                view.typeGroup.getByRole("button", { name: view.texts.typeAll })
            ).toHaveAttribute("aria-pressed", "true")
            await expect(view.categoryGroup.getByRole("button")).toHaveText([
                view.texts.categories.academic,
                view.texts.categories.personal,
                view.texts.categories.professional
            ])
            await expect(view.clearFilters).toHaveCount(0)

            const web = view.typeGroup.getByRole("button", { name: view.texts.projectTypes.web })
            await web.click()
            await expect(web).toHaveAttribute("aria-pressed", "true")
            await expect(
                view.typeGroup.getByRole("button", { name: view.texts.typeAll })
            ).toHaveAttribute("aria-pressed", "false")
            await expectResults(page, language, filterProjects(projects, { type: "web" }))
            await expect(page).toHaveURL(/\?type=web$/)

            await web.click()
            await expect(web).toHaveAttribute("aria-pressed", "true")
            await expectResults(page, language, filterProjects(projects, { type: "web" }))

            const academic = view.categoryGroup.getByRole("button", {
                name: view.texts.categories.academic
            })
            await academic.click()
            await expect(academic).toHaveAttribute("aria-pressed", "true")
            await expectResults(
                page,
                language,
                filterProjects(projects, { type: "web", category: "academic" })
            )
            await expect(page).toHaveURL(/\?type=web&category=academic$/)
            await expect(view.clearFilters).toHaveCount(1)

            await academic.click()
            await expect(academic).toHaveAttribute("aria-pressed", "false")
            await expect(page).toHaveURL(/\?type=web$/)

            await academic.click()
            await view.clearFilters.click()

            await expect(view.search).toBeFocused()
            await expect(page).toHaveURL(new RegExp(`/${language}/projects$`))
            await expect(academic).toHaveAttribute("aria-pressed", "false")
            await expect(
                view.typeGroup.getByRole("button", { name: view.texts.typeAll })
            ).toHaveAttribute("aria-pressed", "true")
            await expect(view.clearFilters).toHaveCount(0)
            await expectResults(page, language, projects)
        })
    }

    test("RF-PROJECTS-07, RF-PROJECTS-11: busca, tipo e categoria combinam por E e Limpar filtros zera os três", async ({
        page
    }) => {
        const projects = loadProjects("pt-BR")
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")

        await view.search.fill("react")
        await expect(page).toHaveURL(/\?q=react$/)
        await view.typeGroup.getByRole("button", { name: view.texts.projectTypes.web }).click()
        await expect(page).toHaveURL(/\?q=react&type=web$/)
        await view.categoryGroup
            .getByRole("button", { name: view.texts.categories.personal })
            .click()

        await expectResults(
            page,
            "pt-BR",
            filterProjects(projects, { q: "react", type: "web", category: "personal" })
        )
        await expect(page).toHaveURL(/\?q=react&type=web&category=personal$/)
        await view.clearFilters.click()
        await expect(view.search).toHaveValue("")
        await expectResults(page, "pt-BR", projects)
    })

    test("RF-PROJECTS-08, A11Y-G08: os botões dos grupos de filtro têm 44px de altura", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        const buttons = view.main.getByRole("group", { name: /./ }).getByRole("button")
        const total = await buttons.count()
        expect(total).toBeGreaterThan(3)

        for (let index = 0; index < total; index++) {
            expect((await getBox(buttons.nth(index))).height).toBeGreaterThanOrEqual(TOUCH_TARGET)
        }
    })

    test("RF-PROJECTS-08: há um separador decorativo, escondido do leitor de tela, entre os dois grupos", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const row = getProjectsView(page, "pt-BR").typeGroup.locator("xpath=..")

        await expect(row.locator(":scope > span")).toHaveCount(1)
        await expect(row.locator(':scope > span[aria-hidden="true"]')).toHaveCount(1)
    })

    test("RF-PROJECTS-08, NF-RE-04: abaixo de 640px a linha de filtros é uma só, rola na horizontal sem barra e encosta nas bordas da tela", async ({
        page
    }) => {
        test.skip(isDesktop(page), "a linha rolável existe só abaixo de 640px")
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        const row = view.typeGroup.locator("xpath=..")
        const viewportWidth = page.viewportSize()?.width ?? 0

        const rowBox = await getBox(row)
        expect(rowBox.x).toBeLessThanOrEqual(1)
        expect(rowBox.width).toBeGreaterThanOrEqual(viewportWidth - 1)
        const metrics = await row.evaluate((element) => ({
            scrollWidth: element.scrollWidth,
            clientWidth: element.clientWidth,
            scrollbarHeight:
                element instanceof HTMLElement ? element.offsetHeight - element.clientHeight : 0,
            overflowX: getComputedStyle(element).overflowX
        }))
        expect(metrics.scrollWidth).toBeGreaterThan(metrics.clientWidth)
        expect(metrics.scrollbarHeight).toBe(0)
        expect(["auto", "scroll"]).toContain(metrics.overflowX)
        const tops = await row
            .getByRole("button")
            .evaluateAll((elements) =>
                elements.map((element) => element.getBoundingClientRect().top)
            )
        expect(new Set(tops.map(Math.round)).size).toBe(1)
    })

    test("A11Y-PS07, RF-PROJECTS-08: abaixo de 640px o Tab alcança todos os botões da linha de filtros", async ({
        page
    }) => {
        test.skip(isDesktop(page), "a linha rolável existe só abaixo de 640px")
        await openProjects(page, "pt-BR")
        const row = getProjectsView(page, "pt-BR").typeGroup.locator("xpath=..")
        const buttons = row.getByRole("button")
        const total = await buttons.count()
        expect(total).toBeGreaterThan(3)

        await buttons.first().focus()
        for (let index = 0; index < total; index++) {
            await expect(buttons.nth(index)).toBeFocused()
            await page.keyboard.press("Tab")
        }
    })

    test("A11Y-PS07, A11Y-G06, RF-PROJECTS-08: abaixo de 640px o botão focado pelo Tab fica dentro da linha, com folga para o contorno de foco", async ({
        page
    }) => {
        test.skip(isDesktop(page), "a linha rolável existe só abaixo de 640px")
        test.fail(
            true,
            "bug: ao focar Acadêmicos a linha não rola e o botão fica cortado (issue a abrir)"
        )
        await openProjects(page, "pt-BR")
        const row = getProjectsView(page, "pt-BR").typeGroup.locator("xpath=..")
        const buttons = row.getByRole("button")
        const total = await buttons.count()
        const outlineReach = 4

        await buttons.first().focus()
        for (let index = 0; index < total; index++) {
            const current = buttons.nth(index)
            await expect(current).toBeFocused()
            await expect
                .poll(async () => {
                    const outer = await getBox(row)
                    const box = await getBox(current)
                    return (
                        box.x - outlineReach >= outer.x - 1 &&
                        box.x + box.width + outlineReach <= outer.x + outer.width + 1
                    )
                })
                .toBe(true)
            await page.keyboard.press("Tab")
        }
    })

    test("RF-PROJECTS-08: a partir de 640px a linha de filtros não rola na horizontal", async ({
        page
    }) => {
        test.skip(!isDesktop(page), "vale só a partir de 640px")
        await openProjects(page, "pt-BR")
        const row = getProjectsView(page, "pt-BR").typeGroup.locator("xpath=..")

        const overflow = await row.evaluate((element) => element.scrollWidth - element.clientWidth)

        expect(overflow).toBeLessThanOrEqual(1)
    })

    test("A11Y-G05, A11Y-PS07: a ordem do Tab segue a ordem visual até os cards", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const projects = sortProjects(loadProjects("pt-BR"), "recent", "pt-BR")
        const texts = UI_TEXTS["pt-BR"].projects
        const expected = [
            texts.searchLabel,
            texts.filtersOpen,
            texts.typeAll,
            ...TYPE_ORDER.filter((type) =>
                projects.some((project) => project.types.includes(type))
            ).map((type) => texts.projectTypes[type]),
            texts.categories.academic,
            texts.categories.personal,
            texts.categories.professional,
            projects[0].title
        ]
        await getProjectsView(page, "pt-BR").search.focus()

        for (const [index, name] of expected.entries()) {
            if (index > 0) {
                await page.keyboard.press("Tab")
            }
            const label = await page.evaluate(() => {
                const active = document.activeElement
                return (
                    active?.getAttribute("aria-label") ||
                    active?.textContent ||
                    (active instanceof HTMLInputElement ? active.labels?.[0]?.textContent : "") ||
                    ""
                ).trim()
            })
            expect(label.replace(/\s+/g, " ")).toContain(name)
        }
    })
})

test.describe("grade", () => {
    test("RF-PROJECTS-17, NF-RE-04: a grade tem 1 coluna em 360 e 390px, 2 em 768px e 3 em 1280px", async ({
        page,
        colorScheme
    }) => {
        test.skip(colorScheme === "dark", "o tema não muda a geometria")
        const expectations = [
            { width: 360, columns: 1 },
            { width: 390, columns: 1 },
            { width: 768, columns: 2 },
            { width: 1280, columns: 3 }
        ]
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        expect(await view.cards.count()).toBeGreaterThanOrEqual(3)

        for (const { width, columns } of expectations) {
            await page.setViewportSize({ width, height: 900 })
            await expect
                .poll(async () => {
                    const lefts = await view.cards.evaluateAll((elements) =>
                        elements.map((element) => Math.round(element.getBoundingClientRect().left))
                    )
                    return new Set(lefts).size
                })
                .toBe(columns)
        }
    })

    for (const width of [360, 390, 768, 1280]) {
        test(`NF-RE-03, A11Y-G11: sem rolagem horizontal em ${width}px na lista e no sem resultado`, async ({
            page,
            colorScheme
        }) => {
            test.skip(colorScheme === "dark" && width !== 360, "um tema basta por largura")
            await page.setViewportSize({ width, height: 900 })
            await openProjects(page, "pt-BR")
            const view = getProjectsView(page, "pt-BR")
            const hasOverflow = () =>
                page.evaluate(
                    () =>
                        document.documentElement.scrollWidth > document.documentElement.clientWidth
                )

            expect(await hasOverflow()).toBe(false)

            await view.search.fill("blockchain")
            await expect(view.status).toHaveText(view.texts.countNone)

            expect(await hasOverflow()).toBe(false)
        })
    }
})

test.describe("card", () => {
    test("RF-PROJECTS-15, RF-PROJECTS-14: clicar fora do título, na área do card, abre o projeto do idioma", async ({
        page
    }) => {
        const [first] = sortProjects(loadProjects("pt-BR"), "recent", "pt-BR")
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")

        const target = await getBox(view.cards.first().locator("time"))
        await page.mouse.click(target.x + target.width / 2, target.y + target.height / 2)

        await expect(page).toHaveURL(new RegExp(`/pt-BR/projects/${first.id}$`))
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(
            UI_TEXTS["pt-BR"].notFoundHeading
        )
    })

    test("RF-PROJECTS-15, NF-MO-01, A11Y-G12: com movimento reduzido o hover não desloca o card", async ({
        page
    }) => {
        test.fail(
            true,
            "bug: o hover desloca o card 3px mesmo com movimento reduzido (issue a abrir)"
        )
        await openProjects(page, "pt-BR")
        const card = getProjectsView(page, "pt-BR").cards.first()

        await card.hover()

        const transforms = await card.evaluate((element) => {
            const chain = [element.parentElement, element, ...element.querySelectorAll("*")]
            return chain.map((node) => (node ? getComputedStyle(node).transform : "none"))
        })
        expect(transforms.every((transform) => transform === "none")).toBe(true)
    })

    test.describe("com movimento pleno", () => {
        test.use({ reducedMotion: "no-preference" })

        test("RF-PROJECTS-15: o hover sobe o card 3px", async ({ page }) => {
            await openProjects(page, "pt-BR")
            const card = getProjectsView(page, "pt-BR").cards.first()

            await card.hover()

            await expect
                .poll(() =>
                    card.evaluate((element) => {
                        const chain = [element.parentElement, element]
                        return chain
                            .map((node) => (node ? getComputedStyle(node).transform : "none"))
                            .some((transform) => transform === "matrix(1, 0, 0, 1, 0, -3)")
                    })
                )
                .toBe(true)
        })
    })
})

test.describe("estado na URL", () => {
    test("RF-PROJECTS-23, RF-PROJECTS-24, NF-TE-04: a URL com type e sort abre a lista filtrada e ordenada sem erro de hidratação", async ({
        page
    }) => {
        const projects = loadProjects("pt-BR")
        const problems = collectConsoleProblems(page)

        await openProjects(page, "pt-BR", "?type=web&sort=title")
        const view = getProjectsView(page, "pt-BR")

        await expect(
            view.typeGroup.getByRole("button", { name: view.texts.projectTypes.web })
        ).toHaveAttribute("aria-pressed", "true")
        await expectResults(page, "pt-BR", filterProjects(projects, { type: "web" }), "title")
        expect(problems).toEqual([])
    })

    test("RF-PROJECTS-23: parâmetro repetido vale o primeiro, desconhecido é ignorado e a URL é reescrita na ordem do documento", async ({
        page
    }) => {
        const projects = loadProjects("pt-BR")
        await openProjects(page, "pt-BR", "?sort=title&type=web&bogus=1&type=api")
        const view = getProjectsView(page, "pt-BR")

        await expectResults(page, "pt-BR", filterProjects(projects, { type: "web" }), "title")
        await view.categoryGroup
            .getByRole("button", { name: view.texts.categories.academic })
            .click()

        await expect(page).toHaveURL(/\/pt-BR\/projects\?type=web&category=academic&sort=title$/)
    })

    test("RF-PROJECTS-23: valores inválidos são ignorados e valem os padrões", async ({ page }) => {
        const projects = loadProjects("pt-BR")

        await openProjects(page, "pt-BR", "?type=xyz&category=nope&sort=bad&year=20&q=")
        const view = getProjectsView(page, "pt-BR")

        await expect(
            view.typeGroup.getByRole("button", { name: view.texts.typeAll })
        ).toHaveAttribute("aria-pressed", "true")
        await expect(view.filtersButton).toHaveText(view.texts.filtersOpen)
        await expectResults(page, "pt-BR", projects)
    })

    test("RF-PROJECTS-23, NF-IA-11: a canônica não leva query", async ({ page }) => {
        await openProjects(page, "pt-BR", "?type=web&sort=title")

        const canonical = await page.locator('link[rel="canonical"]').getAttribute("href")

        expect(canonical).toMatch(/\/pt-BR\/projects$/)
    })
})

test.describe("carregar mais", () => {
    for (const total of [10, 20]) {
        test(`RF-PROJECTS-12, RF-PROJECTS-13, A11Y-PS05: com ${total} projetos os lotes são de 9 e o foco vai ao primeiro card novo`, async ({
            page
        }) => {
            const projects = await serveProjectsFixture(page, "pt-BR", total)
            await openProjectsFromHeader(page, "pt-BR")
            const view = getProjectsView(page, "pt-BR")
            const ordered = sortProjects(projects, "recent", "pt-BR")
            let shown = BATCH

            await expect(view.status).toHaveText(view.texts.count(shown, total))
            await expect(view.cards).toHaveCount(shown)

            while (shown < total) {
                await expect(view.loadMore).toBeVisible()
                await view.loadMore.click()
                const next = Math.min(shown + BATCH, total)

                await expect(view.status).toHaveText(view.texts.count(next, total))
                await expect(view.cards).toHaveCount(next)
                await expect(view.cardLinks.nth(shown)).toBeFocused()
                await expect(view.cardLinks.nth(shown)).toHaveText(ordered[shown].title)
                shown = next
            }

            await expect(view.loadMore).toHaveCount(0)
            await expect(view.cardLinks).toHaveText(ordered.map((project) => project.title))
        })
    }

    test("RF-PROJECTS-13: mudar o filtro depois de carregar mais volta ao primeiro lote", async ({
        page
    }) => {
        const projects = await serveProjectsFixture(page, "pt-BR", 20)
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        await view.loadMore.click()
        await expect(view.cards).toHaveCount(18)

        await view.search.fill("react")

        await expectResults(page, "pt-BR", filterProjects(projects, { q: "react" }))
    })

    test("RF-PROJECTS-25, RF-LAY-32: voltar do projeto restaura a query, a quantidade de cards e a rolagem", async ({
        page
    }) => {
        const projects = await serveProjectsFixture(page, "pt-BR", 20)
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        await view.search.fill("e")
        const matches = filterProjects(projects, { q: "e" })
        expect(matches.length).toBeGreaterThan(BATCH)
        await expect(page).toHaveURL(/\?q=e$/)
        await expect(view.status).toHaveText(view.texts.count(BATCH, matches.length))
        await view.loadMore.click()
        const shown = Math.min(BATCH * 2, matches.length)
        await expect(view.cards).toHaveCount(shown)
        await expect(view.cardLinks.nth(BATCH)).toBeFocused()
        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
        await view.cardLinks.last().focus()
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(1000)
        const scrollBefore = await page.evaluate(() => window.scrollY)
        await page.keyboard.press("Enter")
        await expect(page).toHaveURL(/\/pt-BR\/projects\/[0-9a-f-]+$/)

        await page.goBack()

        await expect(page).toHaveURL(/\/pt-BR\/projects\?q=e$/)
        await expect(view.search).toHaveValue("e")
        await expect(view.status).toHaveText(view.texts.count(shown, matches.length))
        await expect(view.cards).toHaveCount(shown)
        await expect
            .poll(() => page.evaluate(() => window.scrollY))
            .toBeGreaterThan(scrollBefore - 50)
        expect(await page.evaluate(() => window.scrollY)).toBeLessThan(scrollBefore + 50)
    })

    test("RF-PROJECTS-25: o link compartilhado com query abre filtrado e no primeiro lote", async ({
        page
    }) => {
        const projects = await serveProjectsFixture(page, "pt-BR", 20)

        await openProjects(page, "pt-BR", "?sort=title")

        await expectResults(page, "pt-BR", projects, "title")
        await expect(getProjectsView(page, "pt-BR").status).toHaveText(
            UI_TEXTS["pt-BR"].projects.count(BATCH, 20)
        )
    })
})

test.describe("troca de idioma", () => {
    for (const [from, to] of [
        ["pt-BR", "en"],
        ["en", "es"],
        ["es", "pt-BR"]
    ] as const) {
        test(`RF-PROJECTS-25, RF-LAY-12: trocar de ${from} para ${to} mantém a query e abre no primeiro lote`, async ({
            page
        }) => {
            const options = { "pt-BR": "Português", en: "English", es: "Español" }
            const buttons = {
                "pt-BR": "Idioma: Português",
                en: "Language: English",
                es: "Idioma: Español"
            }
            await openProjects(page, from, "?type=web&sort=title")
            const source = getProjectsView(page, from)
            await expect(
                source.typeGroup.getByRole("button", { name: source.texts.projectTypes.web })
            ).toHaveAttribute("aria-pressed", "true")
            if (!isDesktop(page)) {
                await page.getByRole("button", { name: UI_TEXTS[from].menu }).click()
            }
            await page.getByRole("button", { name: buttons[from] }).click()

            await page.getByRole("link", { name: options[to], exact: true }).click()

            await expect(page).toHaveURL(new RegExp(`/${to}/projects\\?type=web&sort=title$`))
            const target = getProjectsView(page, to)
            await expect(target.heading).toHaveText(target.texts.heading)
            await expect(
                target.typeGroup.getByRole("button", { name: target.texts.projectTypes.web })
            ).toHaveAttribute("aria-pressed", "true")
            await expectResults(
                page,
                to,
                filterProjects(loadProjects(to), { type: "web" }),
                "title"
            )
        })
    }
})

test.describe("carregando e erro", () => {
    test("RF-PROJECTS-19, RF-PROJECTS-10, A11Y-G13: com a lista retida há o status Carregando, nove esqueletos escondidos, controles usáveis e sem Limpar filtros nem Carregar mais", async ({
        page
    }) => {
        const projects = loadProjects("pt-BR")
        const release = await holdContent(page, "pt-BR", "projects")
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")

        await expect(view.status).toHaveText(view.texts.loading)
        await expect(view.main.locator('li[aria-hidden="true"]')).toHaveCount(BATCH)
        await expect(view.cards).toHaveCount(0)
        await expect(view.loadMore).toHaveCount(0)
        await expect(view.clearFilters).toHaveCount(0)
        await expect(view.heading).toBeVisible()
        await expect(view.main.getByText(view.texts.intro, { exact: true })).toBeVisible()
        await expect(view.search).toBeEnabled()
        await expect(view.filtersButton).toBeVisible()
        await expect(view.categoryGroup).toBeVisible()

        await view.categoryGroup
            .getByRole("button", { name: view.texts.categories.academic })
            .click()
        release()

        await expectResults(page, "pt-BR", filterProjects(projects, { category: "academic" }))
        await expect(view.main.locator('li[aria-hidden="true"]')).toHaveCount(0)
    })

    for (const language of LANGUAGES) {
        test(`RF-PROJECTS-22, A11Y-G14, NF-IN-03: o erro de ${language} mantém os filtros e Tentar novamente refaz o pedido sem recarregar e foca o h1`, async ({
            page
        }) => {
            const projects = loadProjects(language)
            await page.route(`**/content/${language}/projects.json`, (route) => route.abort())
            await openProjects(page, language, "?type=web")
            const view = getProjectsView(page, language)
            await page.evaluate(() => Reflect.set(window, "e2eMarker", true))

            await expect(view.alert).toBeVisible()
            await expect(view.alert).toContainText(view.texts.errorHeading)
            await expect(view.alert).toContainText(view.texts.errorDescription)
            await expect(view.alert).not.toContainText(/fetch|failed|TypeError|Error:/i)
            await expect(view.status).toHaveText("")
            await expect(view.cards).toHaveCount(0)
            await expect(
                view.typeGroup.getByRole("button", { name: view.texts.projectTypes.web })
            ).toHaveAttribute("aria-pressed", "true")
            await expect(view.search).toBeEnabled()

            await page.unroute(`**/content/${language}/projects.json`)
            await view.alert.getByRole("button", { name: view.texts.errorRetry }).click()

            await expectResults(page, language, filterProjects(projects, { type: "web" }))
            await expect(view.alert).toHaveCount(0)
            await expect(view.heading).toBeFocused()
            expect(await page.evaluate(() => Reflect.get(window, "e2eMarker"))).toBe(true)
            await expect(page).toHaveURL(/\?type=web$/)
        })
    }

    test("RF-PROJECTS-22: o erro mostra os controles e a ordenação do modal continua disponível", async ({
        page
    }) => {
        await page.route("**/content/pt-BR/projects.json", (route) => route.abort())
        await openProjects(page, "pt-BR", "?sort=title")
        const view = getProjectsView(page, "pt-BR")
        await expect(view.alert).toBeVisible()

        await view.filtersButton.click()

        await expect(view.dialog).toBeVisible()
        await expect(view.dialog.getByRole("radio", { name: view.texts.sortTitle })).toBeChecked()
    })

    for (const width of [360, 390, 768, 1280]) {
        test(`NF-RE-03, A11Y-G11: sem rolagem horizontal em ${width}px nos estados carregando e erro`, async ({
            page,
            colorScheme
        }) => {
            test.skip(colorScheme === "dark" && width !== 360, "um tema basta por largura")
            await page.setViewportSize({ width, height: 900 })
            const hasOverflow = () =>
                page.evaluate(
                    () =>
                        document.documentElement.scrollWidth > document.documentElement.clientWidth
                )
            const release = await holdContent(page, "pt-BR", "projects")
            await openProjectsFromHeader(page, "pt-BR")
            const view = getProjectsView(page, "pt-BR")
            await expect(view.status).toHaveText(view.texts.loading)

            expect(await hasOverflow()).toBe(false)
            release()
            await expect(view.cards.first()).toBeVisible()

            await page.unroute("**/content/pt-BR/projects.json")
            await page.route("**/content/pt-BR/projects.json", (route) => route.abort())
            await openProjects(page, "pt-BR", "?sort=title")
            await expect(view.alert).toBeVisible()

            expect(await hasOverflow()).toBe(false)
        })
    }

    test("NF-MO-01, RF-PROJECTS-13: com movimento reduzido o esqueleto não anima", async ({
        page
    }) => {
        const release = await holdContent(page, "pt-BR", "projects")
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        await expect(view.status).toHaveText(view.texts.loading)

        const animations = await view.main
            .locator('li[aria-hidden="true"]')
            .first()
            .evaluate((element) =>
                [element, ...element.querySelectorAll("*")].map((node) => {
                    const style = getComputedStyle(node)
                    return {
                        name: style.animationName,
                        duration: parseFloat(style.animationDuration),
                        iterations: style.animationIterationCount
                    }
                })
            )
        release()

        for (const animation of animations.filter((item) => item.name !== "none")) {
            expect(animation.duration).toBeLessThan(0.001)
            expect(animation.iterations).toBe("1")
        }
    })

    test.describe("com movimento pleno", () => {
        test.use({ reducedMotion: "no-preference" })

        test("NF-MO-01, RF-PROJECTS-13: o esqueleto anima quando o movimento é pleno", async ({
            page
        }) => {
            const release = await holdContent(page, "pt-BR", "projects")
            await openProjectsFromHeader(page, "pt-BR")
            const view = getProjectsView(page, "pt-BR")
            await expect(view.status).toHaveText(view.texts.loading)

            const animations = await view.main
                .locator('li[aria-hidden="true"]')
                .first()
                .evaluate((element) =>
                    [element, ...element.querySelectorAll("*")].map((node) => {
                        const style = getComputedStyle(node)
                        return {
                            name: style.animationName,
                            duration: parseFloat(style.animationDuration),
                            iterations: style.animationIterationCount
                        }
                    })
                )
            release()

            expect(
                animations.some(
                    (item) =>
                        item.name !== "none" &&
                        item.duration > 0.1 &&
                        item.iterations === "infinite"
                )
            ).toBe(true)
        })
    })
})

test.describe("conteúdo e consultas", () => {
    test("RF-PROJECTS-21: sem projeto no conteúdo a tela mostra o aviso e esconde busca, filtros e contagem", async ({
        page
    }) => {
        await page.route("**/content/pt-BR/projects.json", (route) =>
            route.fulfill({ contentType: "application/json", body: JSON.stringify({ items: [] }) })
        )
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")

        await expect(
            view.main.getByRole("heading", { level: 2, name: view.texts.emptyHeading })
        ).toBeVisible()
        await expect(view.main).toContainText(view.texts.emptyDescription)
        await expect(view.heading).toBeVisible()
        await expect(view.search).toHaveCount(0)
        await expect(view.filtersButton).toHaveCount(0)
        await expect(view.status).toHaveCount(0)
        await expect(view.typeGroup).toHaveCount(0)
        await expect(view.cards).toHaveCount(0)
    })

    test("RF-PROJECTS-26, NF-IA-08: o ItemList do JSON-LD traz só os projetos do primeiro lote e continua assim depois de Carregar mais", async ({
        page
    }) => {
        const projects = await serveProjectsFixture(page, "pt-BR", 20)
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        const firstBatch = sortProjects(projects, "recent", "pt-BR")
            .slice(0, BATCH)
            .map((project) => project.title)
        const readItemNames = async () => {
            const raw = await page
                .locator('script[type="application/ld+json"]')
                .first()
                .textContent()
            const itemList = JSON.parse(raw ?? "{}").mainEntity.itemListElement
            return itemList.map((item: { name: string }) => item.name)
        }

        await expect(view.cards).toHaveCount(BATCH)
        expect(await readItemNames()).toEqual(firstBatch)

        await view.loadMore.click()
        await expect(view.cards).toHaveCount(BATCH * 2)

        expect(await readItemNames()).toEqual(firstBatch)
    })

    test("RF-PROJECTS-26, NF-DA-05: a tela lê projects.json e profile.json do idioma ativo uma vez só, mesmo com Carregar mais e o modal", async ({
        page
    }) => {
        const requested: string[] = []
        page.on("request", (request) => {
            if (request.url().includes("/content/")) {
                requested.push(request.url())
            }
        })
        await serveProjectsFixture(page, "pt-BR", 20)
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        await view.loadMore.click()
        await expect(view.cards).toHaveCount(BATCH * 2)
        await view.filtersButton.click()
        await expect(view.dialog.getByRole("group")).toHaveCount(3)

        const jsonRequests = requested.filter((url) => url.endsWith(".json"))
        expect(jsonRequests.every((url) => url.includes("/content/pt-BR/"))).toBe(true)
        expect(jsonRequests.filter((url) => url.endsWith("/projects.json"))).toHaveLength(1)
        expect(
            jsonRequests.filter((url) => url.endsWith("/profile.json")).length
        ).toBeLessThanOrEqual(1)
    })
})

test.describe("sem JavaScript", () => {
    test.use({ javaScriptEnabled: false })

    for (const language of LANGUAGES) {
        test(`NF-CO-03, NF-IA-01, NF-IA-08, RF-PROJECTS-30: ${language} traz h1, introdução, controles, os cards do primeiro lote e o JSON-LD sem JavaScript`, async ({
            page
        }) => {
            const projects = sortProjects(loadProjects(language), "recent", language).slice(
                0,
                BATCH
            )
            await page.goto(`${language}/projects`)
            const view = getProjectsView(page, language)

            await expect(view.heading).toHaveText(view.texts.heading)
            await expect(view.main.getByText(view.texts.intro, { exact: true })).toBeVisible()
            await expect(view.search).toBeVisible()
            await expect(view.filtersButton).toBeVisible()
            await expect(view.typeGroup).toBeVisible()
            await expect(view.categoryGroup).toBeVisible()
            await expect(view.status).toHaveText(view.texts.count(projects.length, projects.length))
            await expect(view.cardLinks).toHaveText(projects.map((project) => project.title))
            for (const [index, project] of projects.entries()) {
                await expect(view.cardLinks.nth(index)).toHaveAttribute(
                    "href",
                    `${FATEC_BASE_PATH}${language}/projects/${project.id}`
                )
            }
            await expect(page).toHaveTitle(view.texts.title)

            await view.filtersButton.click()
            await expect(view.dialog).toHaveCount(0)
            await expect(page.getByRole("group", { name: view.texts.sortLegend })).toHaveCount(0)
            await expect(page.getByRole("combobox")).toHaveCount(0)

            const jsonLd = JSON.parse(
                (await page.locator('script[type="application/ld+json"]').first().textContent()) ??
                    "{}"
            )
            expect(jsonLd["@type"]).toBe("CollectionPage")
            expect(jsonLd.inLanguage).toBe(language)
            const items: { position: number; url: string; name: string }[] =
                jsonLd.mainEntity.itemListElement
            expect(items.map((item) => item.name)).toEqual(projects.map((project) => project.title))
            expect(items.map((item) => item.position)).toEqual(
                projects.map((_p, index) => index + 1)
            )
            for (const [index, item] of items.entries()) {
                expect(item.url).toMatch(
                    new RegExp(`^https?://.+/${language}/projects/${projects[index].id}$`)
                )
            }
        })
    }
})
