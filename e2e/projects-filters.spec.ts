import { expect, test } from "@playwright/test"
import type { Locator, Page } from "@playwright/test"
import collectConsoleProblems from "./support/collectConsoleProblems"
import expectNoAxeViolations from "./support/expectNoAxeViolations"
import filterProjects from "./support/filterProjects"
import getProjectsView from "./support/getProjectsView"
import holdContent from "./support/holdContent"
import openProjectsFromHeader from "./support/openProjectsFromHeader"
import readProfile from "./support/readProfile"
import readProjects from "./support/readProjects"
import serveProjectsFixture from "./support/serveProjectsFixture"
import sortProjects from "./support/sortProjects"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const DESKTOP_MIN_WIDTH = 640
const BATCH = 9
const TOUCH_TARGET = 44
const MODAL_MAX_WIDTH = 480
const SCROLL_OFFSET = 200

type Language = (typeof LANGUAGES)[number]
type Project = ReturnType<typeof readProjects>[number]

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

async function getBox(target: Locator) {
    const box = await target.boundingBox()
    if (!box) {
        throw new Error("o alvo não tem caixa na tela")
    }
    return box
}

async function openFilters(page: Page, language: Language) {
    const view = getProjectsView(page, language)
    await view.filtersButton.click()
    await expect(view.dialog).toBeVisible()
    await expect(view.dialog.getByRole("heading", { level: 2 })).toBeFocused()
    return view
}

async function expectResults(
    page: Page,
    language: Language,
    matches: Project[],
    sort: "recent" | "oldest" | "title" = "recent"
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

function checkbox(view: ReturnType<typeof getProjectsView>, name: string) {
    return view.dialog.getByRole("checkbox", { name, exact: true })
}

function ringOf(input: Locator) {
    return input.evaluate((element) => {
        const style = getComputedStyle(element.nextElementSibling ?? element)
        return { style: style.outlineStyle, width: style.outlineWidth }
    })
}

function collectProjectTechnologies(projects: Project[]) {
    return [...new Set(projects.flatMap((project) => project.technologies))]
}

const closePaths = [
    {
        name: "o botão Fechar",
        close: (view: ReturnType<typeof getProjectsView>) =>
            view.dialog.getByRole("button", { name: view.texts.modalClose }).click()
    },
    {
        name: "a tecla Esc",
        close: (_view: ReturnType<typeof getProjectsView>, page: Page) =>
            page.keyboard.press("Escape")
    },
    {
        name: "o botão Aplicar",
        close: (view: ReturnType<typeof getProjectsView>) =>
            view.dialog.getByRole("button", { name: view.texts.modalApply }).click()
    },
    {
        name: "o clique no fundo",
        close: (_view: ReturnType<typeof getProjectsView>, page: Page) => page.mouse.click(8, 400)
    }
]

test.describe("botão e modal de filtros", () => {
    for (const language of LANGUAGES) {
        test(`RF-PROJECTS-28, RF-PROJECTS-29, RF-PROJECTS-30, A11Y-PS09, A11Y-PS10: o botão de ${language} abre o modal com o foco no título, resumo e as três seções`, async ({
            page
        }) => {
            await openProjects(page, language)
            const view = getProjectsView(page, language)
            const { texts } = view

            await expect(view.filtersButton).toHaveText(texts.filtersOpen)
            await expect(view.filtersButton).toHaveAttribute("aria-haspopup", "dialog")
            await expect(view.filtersButton).toHaveAttribute("aria-expanded", "false")
            await expect(view.filtersButton).not.toHaveAttribute("aria-disabled", /.*/)
            await expect(view.filtersButton.locator("svg")).toHaveAttribute("aria-hidden", "true")
            expect((await getBox(view.filtersButton)).height).toBeGreaterThanOrEqual(TOUCH_TARGET)
            await expect(view.dialog).toHaveCount(0)

            await view.filtersButton.click()

            await expect(view.filtersButton).toHaveAttribute("aria-expanded", "true")
            await expect(page.getByRole("dialog", { name: texts.modalTitle })).toBeVisible()
            await expect(view.dialog).toHaveAttribute("aria-modal", "true")
            const title = view.dialog.getByRole("heading", { level: 2 })
            await expect(title).toHaveText(texts.modalTitle)
            await expect(title).toBeFocused()
            await expect(view.dialog).toContainText(texts.modalSummaryNone)
            await expect(view.dialog.getByRole("group")).toHaveText([
                new RegExp(`^${texts.sortLegend}`),
                new RegExp(`^${texts.modalTechnology}`),
                new RegExp(`^${texts.modalYear}`)
            ])
            await expect(view.dialog.getByRole("group", { name: texts.sortLegend })).toBeVisible()
            await expect(
                view.dialog.getByRole("group", { name: texts.sortLegend }).getByRole("radio")
            ).toHaveCount(3)
            const closeButton = view.dialog.getByRole("button", { name: texts.modalClose })
            expect((await getBox(closeButton)).height).toBeGreaterThanOrEqual(TOUCH_TARGET)
            expect((await getBox(closeButton)).width).toBeGreaterThanOrEqual(TOUCH_TARGET)
            await page.keyboard.press("Tab")
            await expect(closeButton).toBeFocused()
        })
    }

    test("RF-PROJECTS-28, RF-PROJECTS-30: o botão Filtros abre o modal também por Enter", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")

        await view.filtersButton.focus()
        await page.keyboard.press("Enter")

        await expect(view.dialog).toBeVisible()
        await expect(view.dialog.getByRole("heading", { level: 2 })).toBeFocused()
    })

    test("RF-PROJECTS-30, A11Y-PS09: o Tab e o Shift+Tab circulam só dentro do modal", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const view = await openFilters(page, "pt-BR")

        for (let step = 0; step < 60; step++) {
            await page.keyboard.press("Tab")
            expect(
                await view.dialog.evaluate((dialog) => dialog.contains(document.activeElement))
            ).toBe(true)
        }
        await view.dialog.getByRole("heading", { level: 2 }).focus()
        await page.keyboard.press("Shift+Tab")

        await expect(view.dialog.getByRole("button", { name: view.texts.modalApply })).toBeFocused()
    })

    test("RF-PROJECTS-30, A11Y-PS09: com o modal aberto o resto da página fica inerte e volta ao normal ao fechar", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const view = await openFilters(page, "pt-BR")
        const isInert = (role: "main" | "banner" | "contentinfo") =>
            page
                .getByRole(role)
                .first()
                .evaluate((element) => element.closest("[inert]") !== null)

        for (const role of ["main", "banner", "contentinfo"] as const) {
            expect(await isInert(role)).toBe(true)
        }
        await page.keyboard.press("Escape")

        await expect(view.dialog).toHaveCount(0)
        for (const role of ["main", "banner", "contentinfo"] as const) {
            expect(await isInert(role)).toBe(false)
        }
    })

    test("RF-PROJECTS-30: com o modal aberto a rolagem da página trava e é liberada na mesma posição ao fechar", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        await page.evaluate((top) => window.scrollTo(0, top), SCROLL_OFFSET)
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(SCROLL_OFFSET)
        const view = getProjectsView(page, "pt-BR")
        await view.filtersButton.click()
        await expect(view.dialog).toBeVisible()

        const titleBox = await getBox(view.dialog.getByRole("heading", { level: 2 }))
        await page.mouse.move(titleBox.x + titleBox.width / 2, titleBox.y + titleBox.height / 2)
        await page.mouse.wheel(0, 600)
        await page.evaluate(
            () =>
                new Promise((resolve) =>
                    requestAnimationFrame(() => requestAnimationFrame(resolve))
                )
        )
        expect(await page.evaluate(() => window.scrollY)).toBe(SCROLL_OFFSET)
        await page.keyboard.press("Escape")

        await expect(view.dialog).toHaveCount(0)
        expect(await page.evaluate(() => window.scrollY)).toBe(SCROLL_OFFSET)
        await page.mouse.wheel(0, 300)
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(SCROLL_OFFSET)
    })

    test("RF-PROJECTS-30, A11Y-PS09: ao fechar o foco volta ao botão Filtros", async ({ page }) => {
        await openProjects(page, "pt-BR")
        const view = await openFilters(page, "pt-BR")

        await page.keyboard.press("Escape")

        await expect(view.dialog).toHaveCount(0)
        await expect(view.filtersButton).toBeFocused()
    })

    for (const path of closePaths) {
        test(`RF-PROJECTS-29, RF-PROJECTS-09, A11Y-PS09: fechar por ${path.name} aplica o rascunho, escreve a URL por replace e devolve o foco ao botão`, async ({
            page
        }) => {
            test.skip(
                path.name === "o clique no fundo" && !isDesktop(page),
                "abaixo de 640px o modal é tela cheia e não tem fundo"
            )
            const projects = loadProjects("pt-BR")
            await openProjects(page, "pt-BR")
            const view = await openFilters(page, "pt-BR")
            const historyBefore = await page.evaluate(() => history.length)

            await checkbox(view, "React").check()
            await checkbox(view, "TypeScript").check()
            await view.dialog.getByRole("radio", { name: view.texts.sortTitle }).check()

            await expect(view.dialog).toContainText(view.texts.modalSummary(2))
            await expect(page).toHaveURL(/\/pt-BR\/projects$/)
            await expect(view.filtersButton).toHaveText(view.texts.filtersOpen)

            await path.close(view, page)

            await expect(view.dialog).toHaveCount(0)
            await expect(page).toHaveURL(
                /\/pt-BR\/projects\?tech=React&tech=TypeScript&sort=title$/
            )
            expect(await page.evaluate(() => history.length)).toBe(historyBefore)
            await expect(view.filtersButton).toHaveText(view.texts.filtersOpenWithCount(2))
            await expect(view.filtersButton).toBeFocused()
            await expect(view.clearFilters).toHaveCount(1)
            const matches = filterProjects(projects, { tech: ["React", "TypeScript"] })
            expect(matches.length).toBeGreaterThan(0)
            expect(matches.length).toBeLessThan(projects.length)
            await expectResults(page, "pt-BR", matches, "title")
        })
    }

    test("RF-PROJECTS-29: Limpar zera o rascunho, devolve a ordenação ao padrão e não aplica nem fecha; depois, Aplicar limpa a URL", async ({
        page
    }) => {
        const projects = loadProjects("pt-BR")
        await openProjects(page, "pt-BR", "?tech=React&sort=title")
        const view = getProjectsView(page, "pt-BR")
        await expect(view.filtersButton).toHaveText(view.texts.filtersOpenWithCount(1))
        await view.filtersButton.click()
        await expect(view.dialog).toBeVisible()
        await expect(checkbox(view, "React")).toBeChecked()
        await expect(view.dialog.getByRole("radio", { name: view.texts.sortTitle })).toBeChecked()
        await checkbox(view, "TypeScript").check()

        await view.dialog.getByRole("button", { name: view.texts.modalClear }).click()

        await expect(view.dialog).toBeVisible()
        await expect(view.dialog).toContainText(view.texts.modalSummaryNone)
        await expect(checkbox(view, "React")).not.toBeChecked()
        await expect(checkbox(view, "TypeScript")).not.toBeChecked()
        await expect(view.dialog.getByRole("radio", { name: view.texts.sortRecent })).toBeChecked()
        await expect(page).toHaveURL(/\?tech=React&sort=title$/)

        await view.dialog.getByRole("button", { name: view.texts.modalApply }).click()

        await expect(page).toHaveURL(/\/pt-BR\/projects$/)
        await expect(view.filtersButton).toHaveText(view.texts.filtersOpen)
        await expectResults(page, "pt-BR", projects)
    })

    test("RF-PROJECTS-28, RF-PROJECTS-11, RF-PROJECTS-09: a ordenação não conta no botão nem liga Limpar filtros, e Limpar filtros mantém a ordenação", async ({
        page
    }) => {
        const projects = loadProjects("pt-BR")
        await openProjects(page, "pt-BR", "?sort=oldest")
        const view = getProjectsView(page, "pt-BR")

        await expect(view.filtersButton).toHaveText(view.texts.filtersOpen)
        await expect(view.clearFilters).toHaveCount(0)
        await expectResults(page, "pt-BR", projects, "oldest")

        await view.search.fill("react")
        await expect(view.clearFilters).toHaveCount(1)
        await view.clearFilters.click()

        await expect(page).toHaveURL(/\/pt-BR\/projects\?sort=oldest$/)
        await expectResults(page, "pt-BR", projects, "oldest")
    })
})

test.describe("ordenação no modal", () => {
    for (const language of LANGUAGES) {
        test(`RF-PROJECTS-09, A11Y-PS03, A11Y-PS10: ${language} não tem controle de ordenação fora do modal e dentro dele a primeira seção traz três radios com a atual marcada`, async ({
            page
        }) => {
            await openProjects(page, language)
            const view = getProjectsView(page, language)
            const { texts } = view

            await expect(view.main.getByRole("combobox")).toHaveCount(0)
            await expect(view.main.getByRole("radio")).toHaveCount(0)
            await expect(view.main.getByRole("group", { name: texts.sortLegend })).toHaveCount(0)
            await expect(
                view.main.getByRole("button", { name: new RegExp(texts.sortLegend) })
            ).toHaveCount(0)

            await openFilters(page, language)

            await expect(view.dialog.getByRole("group").first()).toHaveAccessibleName(
                texts.sortLegend
            )
            const radios = view.dialog
                .getByRole("group", { name: texts.sortLegend })
                .getByRole("radio")
            await expect(radios).toHaveCount(3)
            await expect(radios.nth(0)).toHaveAccessibleName(texts.sortRecent)
            await expect(radios.nth(1)).toHaveAccessibleName(texts.sortOldest)
            await expect(radios.nth(2)).toHaveAccessibleName(texts.sortTitle)
            await expect(radios.nth(0)).toBeChecked()
            const names = await radios.evaluateAll((items) =>
                items.map((item) => item.getAttribute("name") ?? "")
            )
            expect(names[0]).not.toBe("")
            expect(new Set(names).size).toBe(1)
        })
    }

    test("A11Y-PS08, RF-PROJECTS-09: Tab entra na opção marcada, as setas movem e marcam o rascunho e Tab sai para a seção seguinte", async ({
        page
    }) => {
        const projects = loadProjects("pt-BR")
        await openProjects(page, "pt-BR")
        const view = await openFilters(page, "pt-BR")
        const { texts } = view
        const radio = (name: string) => view.dialog.getByRole("radio", { name })

        await page.keyboard.press("Tab")
        await page.keyboard.press("Tab")
        await expect(radio(texts.sortRecent)).toBeFocused()

        await page.keyboard.press("ArrowDown")
        await expect(radio(texts.sortOldest)).toBeFocused()
        await expect(radio(texts.sortOldest)).toBeChecked()
        await page.keyboard.press("ArrowDown")
        await expect(radio(texts.sortTitle)).toBeChecked()
        await page.keyboard.press("ArrowUp")
        await expect(radio(texts.sortOldest)).toBeChecked()
        await expect(radio(texts.sortRecent)).not.toBeChecked()
        await page.keyboard.press("ArrowDown")
        await expect(radio(texts.sortTitle)).toBeFocused()
        await expect(page).toHaveURL(/\/pt-BR\/projects$/)
        await expectResults(page, "pt-BR", projects)

        await page.keyboard.press("Tab")
        const nextIsTechnology = await view.dialog.evaluate((dialog) => {
            const active = document.activeElement
            const group = active?.closest("fieldset")
            return (
                active instanceof HTMLInputElement &&
                active.type === "checkbox" &&
                !active.disabled &&
                dialog.contains(group ?? null) &&
                group?.querySelector("legend")?.textContent === "Tecnologia"
            )
        })
        expect(nextIsTechnology).toBe(true)

        await view.dialog.getByRole("button", { name: texts.modalApply }).click()

        await expect(page).toHaveURL(/\/pt-BR\/projects\?sort=title$/)
        await expectResults(page, "pt-BR", projects, "title")
        await expect(view.filtersButton).toHaveText(texts.filtersOpen)
        await expect(view.clearFilters).toHaveCount(0)
    })

    test("A11Y-PS08: o Espaço marca a opção focada", async ({ page }) => {
        await openProjects(page, "pt-BR")
        const view = await openFilters(page, "pt-BR")
        const title = view.dialog.getByRole("radio", { name: view.texts.sortTitle })

        await title.focus()
        await expect(title).not.toBeChecked()
        await page.keyboard.press("Space")

        await expect(title).toBeChecked()
    })

    test("A11Y-PS08, A11Y-G06: o anel de foco aparece no teclado e não aparece no clique de mouse, nos radios e no botão Filtros", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        const clickWithMouse = async (target: Locator) => {
            const box = await getBox(target)
            await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
        }

        await clickWithMouse(view.filtersButton)
        await expect(view.dialog).toBeVisible()
        const title = await view.dialog.getByRole("radio", { name: view.texts.sortTitle })
        await clickWithMouse(title)
        await expect(title).toBeChecked()
        expect((await ringOf(title)).style).toBe("none")
        const checkboxInput = checkbox(view, "React")
        await clickWithMouse(checkboxInput)
        await expect(checkboxInput).toBeChecked()
        expect((await ringOf(checkboxInput)).style).toBe("none")

        await clickWithMouse(view.dialog.getByRole("button", { name: view.texts.modalClose }))
        await expect(view.dialog).toHaveCount(0)
        await expect(view.filtersButton).toBeFocused()
        expect(
            await view.filtersButton.evaluate((element) => getComputedStyle(element).outlineStyle)
        ).toBe("none")

        await view.filtersButton.press("Enter")
        await expect(view.dialog).toBeVisible()
        await page.keyboard.press("Tab")
        await page.keyboard.press("Tab")
        const focusedRadio = view.dialog.locator('input[type="radio"]:focus')
        await expect(focusedRadio).toHaveCount(1)
        await expect.poll(() => ringOf(focusedRadio)).toEqual({ style: "solid", width: "2px" })
    })
})

test.describe("geometria e movimento do modal", () => {
    test("RF-PROJECTS-30, NF-RE-04, A11Y-G08: tela cheia abaixo de 640px, até 30rem centralizado a partir de 640px, com cabeçalho e rodapé fixos e alvos de 44px", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const view = await openFilters(page, "pt-BR")
        const viewport = page.viewportSize()
        if (!viewport) {
            throw new Error("sem viewport")
        }
        const box = await getBox(view.dialog)

        if (isDesktop(page)) {
            expect(box.width).toBeLessThanOrEqual(MODAL_MAX_WIDTH + 1)
            expect(Math.abs(box.x + box.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(2)
        } else {
            expect(Math.abs(box.x)).toBeLessThanOrEqual(1)
            expect(Math.abs(box.y)).toBeLessThanOrEqual(1)
            expect(Math.abs(box.width - viewport.width)).toBeLessThanOrEqual(1)
            expect(Math.abs(box.height - viewport.height)).toBeLessThanOrEqual(1)
        }

        const apply = view.dialog.getByRole("button", { name: view.texts.modalApply })
        const close = view.dialog.getByRole("button", { name: view.texts.modalClose })
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.mouse.wheel(0, 2000)
        await expect(apply).toBeInViewport({ ratio: 1 })
        await expect(close).toBeInViewport({ ratio: 1 })

        const inputs = view.dialog.locator("input:not([disabled])")
        const total = await inputs.count()
        expect(total).toBeGreaterThan(5)
        for (let index = 0; index < total; index++) {
            const inputBox = await getBox(inputs.nth(index))
            expect(inputBox.height).toBeGreaterThanOrEqual(TOUCH_TARGET)
            expect(inputBox.width).toBeGreaterThanOrEqual(TOUCH_TARGET)
        }
    })

    test("RF-PROJECTS-30, NF-RE-03, A11Y-G11: com o modal aberto não há rolagem horizontal a 360px", async ({
        page,
        colorScheme
    }) => {
        test.skip(colorScheme === "dark", "o tema não muda a geometria")
        await page.setViewportSize({ width: 360, height: 700 })
        await openProjects(page, "pt-BR")
        const view = await openFilters(page, "pt-BR")

        expect(
            await page.evaluate(
                () => document.documentElement.scrollWidth <= document.documentElement.clientWidth
            )
        ).toBe(true)
        expect(
            await view.dialog.evaluate((dialog) => {
                const right = dialog.getBoundingClientRect().right
                return [...dialog.querySelectorAll("*")].every(
                    (child) => child.getBoundingClientRect().right <= right + 1
                )
            })
        ).toBe(true)
    })

    test("RF-PROJECTS-30, NF-MO-01: com movimento reduzido o modal entra sem animação", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const view = await openFilters(page, "pt-BR")

        const animation = await view.dialog.evaluate((element) => {
            const style = getComputedStyle(element)
            return { name: style.animationName, duration: parseFloat(style.animationDuration) }
        })

        expect(animation.name === "none" || animation.duration < 0.001).toBe(true)
    })

    test.describe("com movimento pleno", () => {
        test.use({ reducedMotion: "no-preference" })

        test("RF-PROJECTS-30: o modal entra com animação quando o movimento é pleno", async ({
            page
        }) => {
            await openProjects(page, "pt-BR")
            const view = getProjectsView(page, "pt-BR")
            await view.filtersButton.click()

            const animation = await view.dialog.evaluate((element) => {
                const style = getComputedStyle(element)
                return { name: style.animationName, duration: parseFloat(style.animationDuration) }
            })

            expect(animation.name).not.toBe("none")
            expect(animation.duration).toBeGreaterThan(0.05)
        })
    })
})

test.describe("opções do modal", () => {
    for (const language of LANGUAGES) {
        test(`RF-PROJECTS-31, A11Y-PS11: as tecnologias do perfil sem projeto aparecem desabilitadas em ${language}, fora do Tab e sem marcar, e as com projeto ficam habilitadas`, async ({
            page
        }) => {
            const projects = loadProjects(language)
            const used = collectProjectTechnologies(projects)
            const withoutProject = readProfile(language).stack.filter(
                (name) => !used.includes(name)
            )
            expect(withoutProject.length).toBeGreaterThan(0)
            await openProjects(page, language)
            const view = await openFilters(page, language)

            for (const name of used) {
                await expect(checkbox(view, name)).toBeEnabled()
            }
            for (const name of withoutProject) {
                const option = view.dialog.getByRole("checkbox", {
                    name: `${name} ${view.texts.noProjects}`,
                    exact: true
                })
                await expect(option).toBeDisabled()
                await option.click({ force: true })
                await expect(option).not.toBeChecked()
            }
            await expect(view.dialog).toContainText(view.texts.modalSummaryNone)

            const focusedDisabled: boolean[] = []
            for (let step = 0; step < 100; step++) {
                await page.keyboard.press("Tab")
                focusedDisabled.push(
                    await page.evaluate(
                        () =>
                            document.activeElement instanceof HTMLInputElement &&
                            document.activeElement.disabled
                    )
                )
                if (
                    await view.dialog
                        .getByRole("button", { name: view.texts.modalApply })
                        .evaluate((element) => element === document.activeElement)
                ) {
                    break
                }
            }
            expect(focusedDisabled.length).toBeGreaterThan(used.length)
            expect(focusedDisabled.every((isDisabled) => !isDisabled)).toBe(true)
        })
    }

    test("RF-PROJECTS-29, RF-PROJECTS-31: anos do menor ao maior ano de projeto, do mais recente ao mais antigo, e tecnologias em ordem alfabética", async ({
        page
    }) => {
        const projects = loadProjects("pt-BR")
        await openProjects(page, "pt-BR")
        const view = await openFilters(page, "pt-BR")
        const years = projects.map((project) => Number(project.year))
        const expectedYears: string[] = []
        for (let year = Math.max(...years); year >= Math.min(...years); year--) {
            expectedYears.push(String(year))
        }

        const yearLabels = await view.dialog
            .getByRole("group", { name: view.texts.modalYear })
            .getByRole("checkbox")
            .evaluateAll((items) =>
                items.map((item) => item.closest("label")?.textContent?.trim() ?? "")
            )
        expect(yearLabels).toEqual(expectedYears)
        const names = await view.dialog
            .getByRole("group", { name: view.texts.modalTechnology })
            .getByRole("checkbox")
            .evaluateAll((items) =>
                items.map((item) => item.closest("label")?.textContent?.trim() ?? "")
            )
        const collator = new Intl.Collator("pt-BR", { sensitivity: "base" })
        expect(names).toEqual(names.toSorted(collator.compare))
    })

    test("RF-PROJECTS-31, RF-PROJECTS-28, A11Y-PS11: o valor da URL sem projeto abre marcado e habilitado, conta no botão e, desmarcado, fica desabilitado e some da URL ao aplicar", async ({
        page
    }) => {
        const projects = loadProjects("pt-BR")
        const used = collectProjectTechnologies(projects)
        const [orphan] = readProfile("pt-BR").stack.filter((name) => !used.includes(name))
        expect(orphan).toBeDefined()
        const problems = collectConsoleProblems(page)
        await openProjects(page, "pt-BR", `?tech=${orphan}`)
        const view = getProjectsView(page, "pt-BR")

        await expect(view.filtersButton).toHaveText(view.texts.filtersOpenWithCount(1))
        await expect(view.status).toHaveText(view.texts.countNone)
        await expect(
            view.main.getByRole("heading", { level: 2, name: view.texts.noResultsHeading })
        ).toBeVisible()
        await view.filtersButton.click()
        await expect(view.dialog).toBeVisible()
        const option = checkbox(view, orphan)
        await expect(option).toBeChecked()
        await expect(option).toBeEnabled()
        await expect(view.dialog).toContainText(view.texts.modalSummary(1))

        await option.uncheck()

        const disabled = view.dialog.getByRole("checkbox", {
            name: `${orphan} ${view.texts.noProjects}`,
            exact: true
        })
        await expect(disabled).toBeDisabled()
        await expect(disabled).not.toBeChecked()
        await view.dialog.getByRole("button", { name: view.texts.modalApply }).click()

        await expect(page).toHaveURL(/\/pt-BR\/projects$/)
        await expect(view.filtersButton).toHaveText(view.texts.filtersOpen)
        await expect(view.status).toHaveText(view.texts.count(projects.length, projects.length))
        expect(problems).toEqual([])
    })

    test("RF-PROJECTS-31, RF-PROJECTS-29: valor da URL fora do catálogo não aparece no modal, conta no botão, é mantido ao aplicar outras escolhas e some com Limpar filtros", async ({
        page
    }) => {
        await openProjects(page, "pt-BR", "?tech=ZzzInexistente")
        const view = getProjectsView(page, "pt-BR")
        await expect(view.filtersButton).toHaveText(view.texts.filtersOpenWithCount(1))
        await expect(view.status).toHaveText(view.texts.countNone)

        await view.filtersButton.click()
        await expect(view.dialog).toBeVisible()
        await expect(checkbox(view, "ZzzInexistente")).toHaveCount(0)
        await checkbox(view, "React").check()
        await view.dialog.getByRole("button", { name: view.texts.modalApply }).click()

        await expect(page).toHaveURL(/\?tech=React&tech=ZzzInexistente$/)
        await expect(view.filtersButton).toHaveText(view.texts.filtersOpenWithCount(2))

        await view.clearFilters.first().click()

        await expect(page).toHaveURL(/\/pt-BR\/projects$/)
        await expect(view.filtersButton).toHaveText(view.texts.filtersOpen)
    })

    test("RF-PROJECTS-31: com o perfil retido o modal abre só com Ordenar e as seções entram quando ele chega", async ({
        page
    }) => {
        const release = await holdContent(page, "pt-BR", "profile")
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        await expect(view.cards.first()).toBeVisible()

        await view.filtersButton.click()

        await expect(view.dialog).toBeVisible()
        await expect(view.dialog.getByRole("group")).toHaveCount(1)
        await expect(view.dialog.getByRole("group", { name: view.texts.sortLegend })).toBeVisible()
        await expect(view.alert).toHaveCount(0)
        release()

        await expect(view.dialog.getByRole("group")).toHaveCount(3)
        await expect(checkbox(view, "React")).toBeVisible()
    })

    test("RF-PROJECTS-31: com o perfil falhando a lista segue, o botão abre só com Ordenar e a tela não mostra erro novo", async ({
        page
    }) => {
        await page.route("**/content/pt-BR/profile.json", (route) => route.abort())
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        const projects = loadProjects("pt-BR")

        await expect(view.status).toHaveText(view.texts.count(projects.length, projects.length))
        await view.filtersButton.click()

        await expect(view.dialog).toBeVisible()
        await expect(view.dialog.getByRole("group")).toHaveCount(1)
        await expect(page.getByRole("alert")).toHaveCount(0)
    })

    test("RF-PROJECTS-31: as opções do modal entram no HTML pré-renderizado e hidratam sem nenhuma requisição de conteúdo", async ({
        page
    }) => {
        await page.route("**/content/**/*.json", (route) => route.abort())
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")

        await view.filtersButton.click()

        await expect(view.dialog.getByRole("group")).toHaveCount(3)
        await expect(checkbox(view, "React")).toBeVisible()
        await expect(view.alert).toHaveCount(0)
    })

    test("RF-PROJECTS-31, RF-PROJECTS-24, NF-TE-04: a URL com tecnologia e ano abre com Filtros (2) e a lista filtrada sem erro de hidratação", async ({
        page
    }) => {
        const projects = loadProjects("pt-BR")
        const problems = collectConsoleProblems(page)
        await openProjects(page, "pt-BR", "?tech=React&year=2025")
        const view = getProjectsView(page, "pt-BR")

        await expect(view.filtersButton).toHaveText(view.texts.filtersOpenWithCount(2))
        await expectResults(
            page,
            "pt-BR",
            filterProjects(projects, { tech: ["React"], year: ["2025"] })
        )
        await view.filtersButton.click()
        await expect(checkbox(view, "React")).toBeChecked()
        await expect(checkbox(view, "2025")).toBeChecked()
        expect(problems).toEqual([])
    })
})

test.describe("lógica das tecnologias e dos anos", () => {
    for (const language of LANGUAGES) {
        test(`RF-PROJECTS-29, RF-PROJECTS-07: em ${language}, anos combinam por OU, tecnologias por E e os campos entre si por E`, async ({
            page
        }) => {
            const projects = await serveProjectsFixture(page, language, 20)
            await openProjectsFromHeader(page, language)
            const view = getProjectsView(page, language)
            await expect(view.status).toHaveText(view.texts.count(BATCH, projects.length))
            const applyFilters = async () => {
                await view.dialog.getByRole("button", { name: view.texts.modalApply }).click()
                await expect(view.dialog).toHaveCount(0)
            }

            await view.filtersButton.click()
            await checkbox(view, "2018").check()
            await checkbox(view, "2019").check()
            await applyFilters()

            const byYears = filterProjects(projects, { year: ["2018", "2019"] })
            expect(byYears.length).toBeGreaterThan(
                filterProjects(projects, { year: ["2018"] }).length
            )
            await expectResults(page, language, byYears)
            await expect(page).toHaveURL(new RegExp(`/${language}/projects\\?year=2018&year=2019$`))

            await view.filtersButton.click()
            await checkbox(view, "React").check()
            await checkbox(view, "Docker").check()
            await applyFilters()

            const technologies = filterProjects(projects, { tech: ["Docker", "React"] })
            expect(technologies.length).toBeGreaterThan(0)
            expect(technologies.length).toBeLessThan(
                filterProjects(projects, { tech: ["React"] }).length
            )
            const combined = filterProjects(projects, {
                tech: ["Docker", "React"],
                year: ["2018", "2019"]
            })
            expect(combined.length).toBeGreaterThan(0)
            expect(combined.length).toBeLessThan(technologies.length)
            await expectResults(page, language, combined)
            await expect(view.filtersButton).toHaveText(view.texts.filtersOpenWithCount(4))
            await expect(page).toHaveURL(
                new RegExp(`/${language}/projects\\?tech=Docker&tech=React&year=2018&year=2019$`)
            )
        })
    }
})

test.describe("acessibilidade do modal e dos estados", () => {
    for (const language of ["pt-BR", "en"] as const) {
        test(`A11Y-G03, A11Y-G04, A11Y-PS11: ${language} com o modal aberto não tem violações do axe`, async ({
            page
        }) => {
            await openProjects(page, language)
            await openFilters(page, language)

            await expectNoAxeViolations(page)
        })
    }

    test("A11Y-G03, A11Y-G04: o estado sem resultado não tem violações do axe", async ({
        page
    }) => {
        await openProjects(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")

        await view.search.fill("blockchain")
        await expect(view.status).toHaveText(view.texts.countNone)

        await expectNoAxeViolations(page)
    })

    test("A11Y-G03, A11Y-G04, A11Y-G14: o estado de erro não tem violações do axe", async ({
        page
    }) => {
        await page.route("**/content/pt-BR/projects.json", (route) => route.abort())
        await openProjects(page, "pt-BR", "?sort=title")
        await expect(getProjectsView(page, "pt-BR").alert).toBeVisible()

        await expectNoAxeViolations(page)
    })

    test("A11Y-G03, A11Y-G04, A11Y-G13: o estado carregando não tem violações do axe", async ({
        page
    }) => {
        const release = await holdContent(page, "pt-BR", "projects")
        await openProjectsFromHeader(page, "pt-BR")
        const view = getProjectsView(page, "pt-BR")
        await expect(view.status).toHaveText(view.texts.loading)

        await expectNoAxeViolations(page)
        release()
    })
})
