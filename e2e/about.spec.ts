import { AxeBuilder } from "@axe-core/playwright"
import { expect, test } from "@playwright/test"
import type { Locator, Page } from "@playwright/test"
import chooseLanguageInHeader from "./support/chooseLanguageInHeader"
import holdContent from "./support/holdContent"
import readAbout from "./support/readAbout"
import readContentWidth from "./support/readContentWidth"
import UI_TEXTS from "./support/uiTexts"
import waitForHydration from "./support/waitForHydration"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const DESKTOP_MIN_WIDTH = 640
const MODAL_MAX_WIDTH = 544
const CENTER_TOLERANCE = 24
const BASE_URL_SEGMENT = "/ra2581392423047/"

type Language = (typeof LANGUAGES)[number]

type Box = { x: number; y: number; width: number; height: number }

type Rgb = { r: number; g: number; b: number }

function parseColor(color: string): Rgb {
    const channels = color.match(/[\d.]+/g)?.map(Number) ?? [0, 0, 0]
    return { r: channels[0], g: channels[1], b: channels[2] }
}

function getLuminance(color: Rgb) {
    const [r, g, b] = [color.r, color.g, color.b].map((value) => {
        const channel = value / 255
        return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

async function openAbout(page: Page, language: Language) {
    await page.goto(`${language}/about`)
    await page.getByRole("heading", { level: 1 }).waitFor()
    await waitForHydration(page)
}

async function openAboutFromHeader(page: Page, language: Language) {
    const texts = UI_TEXTS[language]
    await page.goto(`${language}/rota-inexistente`)
    await page.getByRole("heading", { level: 1 }).waitFor()
    if ((page.viewportSize()?.width ?? 0) < DESKTOP_MIN_WIDTH) {
        await page.getByRole("button", { name: texts.menu }).click()
    }
    await page
        .getByRole("navigation", { name: texts.navigationLabel })
        .getByRole("link", { name: texts.navigation.about, exact: true })
        .click()
    await expect(page).toHaveURL(new RegExp(`/${language}/about$`))
}

function styleOf(locator: Locator) {
    return locator.evaluate((element) => {
        const style = getComputedStyle(element)
        return { size: parseFloat(style.fontSize), family: style.fontFamily }
    })
}

async function getBox(locator: Locator): Promise<Box> {
    const box = await locator.boundingBox()
    if (!box) {
        throw new Error("elemento sem caixa visível")
    }
    return box
}

function getTrajectoryItem(page: Page, highlight: string) {
    return page.getByRole("button", { name: highlight })
}

function getDialog(page: Page) {
    return page.getByRole("dialog")
}

async function getFirstEntryOpener(page: Page, language: Language) {
    const entry = readAbout(language).entries[0]
    expect(entry).toBeDefined()
    return { entry, opener: getTrajectoryItem(page, entry.highlight) }
}

test.describe("estrutura e apresentação", () => {
    for (const language of LANGUAGES) {
        const texts = UI_TEXTS[language].aboutPage

        test(`RF-ABOUT-01, RF-ABOUT-04, RF-ABOUT-28, A11Y-G01, A11Y-G02: em ${language} a tela tem um h1, o rótulo, o título, a descrição e as seções na ordem`, async ({
            page
        }) => {
            await openAbout(page, language)

            await expect(page.getByRole("heading", { level: 1 })).toHaveText(texts.heading)
            await expect(
                page.getByRole("main").getByText(texts.label, { exact: true })
            ).toBeVisible()
            await expect(page).toHaveTitle(texts.title)
            await expect(page.locator('meta[name="description"]')).toHaveAttribute(
                "content",
                texts.description
            )
            await expect(page.locator("html")).toHaveAttribute("lang", language)
            await expect(page.getByRole("main")).toHaveCount(1)
            await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
                texts.aboutMe,
                texts.stack,
                texts.certificates,
                texts.workStyle,
                texts.trajectory
            ])
        })

        test(`RF-ABOUT-05: em ${language} Baixar CV é um link para o PDF do idioma, sem download nem target`, async ({
            page
        }) => {
            await openAbout(page, language)

            const link = page.getByRole("main").getByRole("link", { name: texts.resumeName })
            await expect(link).toBeVisible()
            await expect(link).toHaveText(texts.download)
            await expect(link).toHaveAttribute("href", `${BASE_URL_SEGMENT}cv/cv-${language}.pdf`)
            await expect(link).not.toHaveAttribute("download", /.*/)
            await expect(link).not.toHaveAttribute("target", /.*/)
        })

        test(`RF-ABOUT-06, NF-IN-11: em ${language} Entrar em contato leva à tela de contato do idioma`, async ({
            page
        }) => {
            await openAbout(page, language)

            const link = page
                .getByRole("main")
                .getByRole("link", { name: UI_TEXTS[language].contactCta })
            await expect(link).toHaveAttribute("href", `${BASE_URL_SEGMENT}${language}/contact`)
            await link.click()

            await expect(page).toHaveURL(new RegExp(`/${language}/contact$`))
        })

        test(`RF-ABOUT-08, RF-ABOUT-09, RF-ABOUT-13: em ${language} stack e trajetória têm os grupos na ordem, com a contagem em texto`, async ({
            page
        }) => {
            await openAbout(page, language)
            const about = readAbout(language)
            const main = page.getByRole("main")

            for (const [index, category] of texts.stackCategories.entries()) {
                const count = about.stackCounts[index]
                const noun = count === 1 ? texts.stackCountOne : texts.stackCountOther
                const heading = main.getByRole("heading", { level: 3, name: category, exact: true })
                await expect(heading).toBeVisible()
                await expect(heading.locator("..")).toContainText(`${count} ${noun}`)
            }
            for (const [index, group] of texts.groups.entries()) {
                const kind = (["experience", "education", "course"] as const)[index]
                const count = about.entries.filter((entry) => entry.kind === kind).length
                const noun = count === 1 ? texts.itemCountOne : texts.itemCountOther
                const heading = main.getByRole("heading", { level: 3, name: group, exact: true })
                await expect(heading).toBeVisible()
                await expect(heading.locator("..")).toContainText(`${count} ${noun}`)
            }
        })

        test(`RF-ABOUT-15, RF-ABOUT-16: em ${language} o item em curso tem o selo ${texts.current} e o período com desde`, async ({
            page
        }) => {
            await openAbout(page, language)
            const current = readAbout(language).entries.find((entry) => entry.isCurrent)
            expect(current).toBeDefined()

            const item = getTrajectoryItem(page, current?.highlight ?? "")

            await expect(item).toHaveAttribute("aria-haspopup", "dialog")
            await expect(item).toHaveAttribute("type", "button")
            await expect(item).toContainText(texts.current)
            await expect(item).toContainText(texts.since)
            expect((await getBox(item)).height).toBeGreaterThanOrEqual(44)
        })
    }
})

test.describe("layout", () => {
    test("RF-ABOUT-04, RF-ABOUT-07: a apresentação fica centralizada na largura da tela", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")
        const about = readAbout("pt-BR")
        const photo = await getBox(
            page.getByRole("img", { name: UI_TEXTS["pt-BR"].aboutPage.photoAlt })
        )
        const summary = await getBox(
            page.getByRole("main").getByText(about.summary, { exact: true })
        )
        const viewportWidth = await readContentWidth(page)

        const left = Math.min(photo.x, summary.x)
        const right = Math.max(photo.x + photo.width, summary.x + summary.width)

        expect(Math.abs(left - (viewportWidth - right))).toBeLessThanOrEqual(CENTER_TOLERANCE)
    })

    test("RF-ABOUT-03: até 639px localização e selo ficam à direita da foto e, a partir de 640px, abaixo dela", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")
        const about = readAbout("pt-BR")
        const photo = page.getByRole("img", { name: UI_TEXTS["pt-BR"].aboutPage.photoAlt })
        const location = page.getByRole("main").getByText(about.location, { exact: true })

        await page.setViewportSize({ width: 639, height: 844 })
        const narrowPhoto = await getBox(photo)
        const narrowLocation = await getBox(location)
        expect(narrowLocation.x).toBeGreaterThanOrEqual(narrowPhoto.x + narrowPhoto.width)
        expect(narrowLocation.y).toBeLessThan(narrowPhoto.y + narrowPhoto.height)

        await page.setViewportSize({ width: 640, height: 844 })
        const widePhoto = await getBox(photo)
        const wideLocation = await getBox(location)
        expect(wideLocation.y).toBeGreaterThanOrEqual(widePhoto.y + widePhoto.height - 1)
    })

    test("RF-ABOUT-07: Sobre mim é uma coluna única, sem divisórias entre os parágrafos", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")
        const about = readAbout("pt-BR")
        expect(about.aboutParagraphs.length).toBeGreaterThan(1)
        const main = page.getByRole("main")

        const boxes: Box[] = []
        for (const paragraph of about.aboutParagraphs) {
            const locator = main.getByText(paragraph, { exact: true })
            boxes.push(await getBox(locator))
            const borders = await locator.evaluate((element) => {
                const parent = getComputedStyle(element.parentElement ?? element)
                const own = getComputedStyle(element)
                return [
                    own.borderTopWidth,
                    own.borderBottomWidth,
                    parent.borderTopWidth,
                    parent.borderBottomWidth
                ]
            })
            expect(borders).toEqual(["0px", "0px", "0px", "0px"])
        }
        for (const [index, box] of boxes.entries()) {
            expect(box.x).toBe(boxes[0].x)
            if (index > 0) {
                expect(box.y).toBeGreaterThanOrEqual(boxes[index - 1].y + boxes[index - 1].height)
            }
        }
        await expect(
            main.getByRole("region", { name: UI_TEXTS["pt-BR"].aboutPage.aboutMe }).locator("hr")
        ).toHaveCount(0)
    })

    test("RF-ABOUT-10, A11Y-G10: a faixa de Complementos é cinza no tema claro e escura no escuro, com chips legíveis", async ({
        page
    }, testInfo) => {
        await openAbout(page, "pt-BR")
        const texts = UI_TEXTS["pt-BR"].aboutPage
        const band = page.getByRole("region", { name: `${texts.certificates} ${texts.workStyle}` })
        await band.scrollIntoViewIfNeeded()

        const colors = await band.evaluate((element) => {
            const chip = element.querySelector("ul li")?.firstElementChild ?? element
            const resolved = [element, chip].map((start) => {
                let current: Element | null = start
                while (current) {
                    const color = getComputedStyle(current).backgroundColor
                    if (!color.startsWith("rgba(") || color.endsWith(", 1)")) {
                        return color
                    }
                    current = current.parentElement
                }
                return "rgb(255, 255, 255)"
            })
            return {
                band: resolved[0],
                chipBackground: resolved[1],
                chipText: getComputedStyle(chip).color,
                page: getComputedStyle(document.body).backgroundColor
            }
        })
        const bandColor = parseColor(colors.band)
        const chipBackground = parseColor(colors.chipBackground)
        const chipText = parseColor(colors.chipText)
        const bright = Math.max(getLuminance(chipText), getLuminance(chipBackground))
        const dark = Math.min(getLuminance(chipText), getLuminance(chipBackground))
        const result = {
            bandLuminance: getLuminance(bandColor),
            differsFromPage: colors.band !== colors.page,
            chipContrast: (bright + 0.05) / (dark + 0.05)
        }

        expect(result.differsFromPage).toBe(true)
        expect(result.chipContrast).toBeGreaterThanOrEqual(4.5)
        if (testInfo.project.name.endsWith("dark")) {
            expect(result.bandLuminance).toBeLessThan(0.2)
        } else {
            expect(result.bandLuminance).toBeGreaterThan(0.6)
            expect(result.bandLuminance).toBeLessThan(0.99)
        }
    })
})

test.describe("tamanho do texto", () => {
    test("RF-ABOUT-10: chips a partir de 12px, período e detalhes a partir de 14px, Como eu trabalho na fonte do corpo e sem rolagem horizontal", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")
        const texts = UI_TEXTS["pt-BR"].aboutPage
        const band = page.getByRole("region", { name: `${texts.certificates} ${texts.workStyle}` })
        await band.scrollIntoViewIfNeeded()

        const principle = await styleOf(band.locator("ul li span").last())
        const certificate = await styleOf(band.locator("ul li span").first())
        const trajectoryButton = page.locator("button[aria-haspopup='dialog']").first()
        const period = await styleOf(trajectoryButton.locator("time").first())
        const details = await styleOf(trajectoryButton.locator("span[class*='details']").first())
        const scroll = await page.evaluate(() => ({
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth
        }))

        expect(principle.size).toBeGreaterThanOrEqual(12)
        expect(principle.family).toContain("Plex Sans")
        expect(certificate.family).toContain("Plex Mono")
        expect(period.size).toBeGreaterThanOrEqual(14)
        expect(details.size).toBeGreaterThanOrEqual(14)
        expect(scroll.scrollWidth).toBeLessThanOrEqual(scroll.clientWidth)
    })
})

test.describe("cartão Agora", () => {
    for (const language of LANGUAGES) {
        test(`RF-ABOUT-07: em ${language} o cartão é um grupo nomeado com cargo, modalidade e links em nova aba`, async ({
            page
        }) => {
            await openAbout(page, language)
            const texts = UI_TEXTS[language].aboutPage
            const about = readAbout(language)

            const card = page.getByRole("group", { name: texts.nowHeading })

            await expect(card).toHaveCount(1)
            await expect(card).toContainText(texts.nowRole)
            await expect(card).toContainText(about.role)
            await expect(card).toContainText(texts.nowMode)
            await expect(card).toContainText(about.mode)
            const links = card.getByRole("link")
            await expect(links).toHaveCount(2)
            await expect(links.nth(0)).toHaveAttribute("href", about.github)
            await expect(links.nth(1)).toHaveAttribute("href", about.linkedin)
            await expect(links.nth(0)).toHaveAttribute("target", "_blank")
            await expect(links.nth(1)).toHaveAttribute("target", "_blank")
            await expect(links.nth(0)).toContainText("GitHub")
            await expect(links.nth(1)).toContainText("LinkedIn")
        })
    }

    test("RF-ABOUT-07: a partir de 900px o cartão fica ao lado do texto e abaixo de 900px desce para baixo dele", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")
        const about = readAbout("pt-BR")
        const card = page.getByRole("group", {
            name: UI_TEXTS["pt-BR"].aboutPage.nowHeading
        })
        const lastParagraph = page
            .getByRole("main")
            .getByText(about.aboutParagraphs[about.aboutParagraphs.length - 1], { exact: true })

        await page.setViewportSize({ width: 900, height: 900 })
        const wideCard = await getBox(card)
        const wideParagraph = await getBox(lastParagraph)
        expect(wideCard.x).toBeGreaterThanOrEqual(wideParagraph.x + wideParagraph.width)

        await page.setViewportSize({ width: 899, height: 900 })
        const narrowCard = await getBox(card)
        const narrowParagraph = await getBox(lastParagraph)
        expect(narrowCard.y).toBeGreaterThanOrEqual(narrowParagraph.y + narrowParagraph.height)
    })

    test("A11Y-G04: o cartão não é um aside aninhado e landmark-complementary-is-top-level não aponta nada", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")

        await expect(page.getByRole("main").locator("aside")).toHaveCount(0)
        await expect(page.getByRole("complementary")).toHaveCount(0)
        const { violations } = await new AxeBuilder({ page })
            .withRules(["landmark-complementary-is-top-level"])
            .analyze()
        expect(violations.map((violation) => violation.id)).toEqual([])
    })
})

test.describe("modal da trajetória", () => {
    for (const language of LANGUAGES) {
        test(`RF-ABOUT-17, RF-ABOUT-20, RF-ABOUT-22: em ${language} o clique abre o modal com foco no título, resto inerte e rolagem travada, sem mudar a URL`, async ({
            page
        }) => {
            await openAbout(page, language)
            const texts = UI_TEXTS[language].aboutPage
            const { entry, opener } = await getFirstEntryOpener(page, language)
            const url = page.url()

            await opener.click()

            const dialog = getDialog(page)
            await expect(dialog).toBeVisible()
            await expect(dialog).toHaveAttribute("aria-modal", "true")
            await expect(dialog).toHaveAccessibleName(entry.highlight)
            await expect(
                dialog.getByRole("heading", { level: 2, name: entry.highlight })
            ).toBeFocused()
            await expect(dialog.getByText(entry.summary)).toBeVisible()
            await expect(dialog.getByRole("button", { name: texts.close })).toBeVisible()
            await expect(page.locator("#root")).toHaveAttribute("inert", "")
            await expect(page.locator("body")).toHaveAttribute("data-scroll-locked", /.*/)
            expect(page.url()).toBe(url)
        })
    }

    test("RF-ABOUT-23: o detalhe só entra na árvore de acessibilidade depois de abrir o item", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")
        const texts = UI_TEXTS["pt-BR"].aboutPage
        const { entry, opener } = await getFirstEntryOpener(page, "pt-BR")
        const responsibilities = page.getByRole("heading", {
            level: 3,
            name: texts.responsibilities
        })
        await expect(responsibilities).toHaveCount(0)
        await expect(page.getByText(entry.summary)).toBeHidden()

        await opener.click()

        await expect(responsibilities).toHaveCount(1)
        await expect(getDialog(page).getByText(entry.summary)).toBeVisible()
    })

    test("RF-ABOUT-20, A11Y-IF04: Enter e Espaço abrem o item, o Tab circula só dentro e Esc devolve o foco ao item", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")
        const { entry, opener } = await getFirstEntryOpener(page, "pt-BR")
        const dialog = getDialog(page)

        for (const key of ["Enter", "Space"]) {
            await opener.focus()
            await page.keyboard.press(key)
            await expect(dialog).toBeVisible()
            await expect(
                dialog.getByRole("heading", { level: 2, name: entry.highlight })
            ).toBeFocused()

            for (let step = 0; step < 6; step += 1) {
                await page.keyboard.press("Tab")
                expect(await dialog.evaluate((box) => box.contains(document.activeElement))).toBe(
                    true
                )
            }
            for (let step = 0; step < 6; step += 1) {
                await page.keyboard.press("Shift+Tab")
                expect(await dialog.evaluate((box) => box.contains(document.activeElement))).toBe(
                    true
                )
            }

            await page.keyboard.press("Escape")
            await expect(dialog).toHaveCount(0)
            await expect(opener).toBeFocused()
            await expect(page.locator("#root")).not.toHaveAttribute("inert")
            await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked")
        }
    })

    test("RF-ABOUT-20: Fechar e o clique no fundo fecham o modal, devolvem o foco ao item e mantêm a rolagem", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")
        const texts = UI_TEXTS["pt-BR"].aboutPage
        const { opener } = await getFirstEntryOpener(page, "pt-BR")
        const dialog = getDialog(page)
        await opener.scrollIntoViewIfNeeded()
        const scrollBefore = await page.evaluate(() => window.scrollY)

        await opener.click()
        await dialog.getByRole("button", { name: texts.close }).click()
        await expect(dialog).toHaveCount(0)
        await expect(opener).toBeFocused()
        expect(Math.abs((await page.evaluate(() => window.scrollY)) - scrollBefore)).toBeLessThan(5)

        await opener.click()
        await expect(dialog).toBeVisible()
        if ((page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH) {
            await page.mouse.click(2, 2)
            await expect(dialog).toHaveCount(0)
            await expect(opener).toBeFocused()
        }
    })

    test("RF-ABOUT-22: voltar do navegador com o modal aberto o fecha e libera a rolagem", async ({
        page
    }) => {
        await openAboutFromHeader(page, "pt-BR")
        await page.getByRole("heading", { level: 1 }).waitFor()
        await waitForHydration(page)
        const { opener } = await getFirstEntryOpener(page, "pt-BR")
        await opener.click()
        await expect(getDialog(page)).toBeVisible()

        await page.goBack()

        await expect(getDialog(page)).toHaveCount(0)
        await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked")
    })

    test("RF-ABOUT-21, NF-RE-03, NF-RE-04: tela cheia abaixo de 640px, caixa de até 34rem a partir dele e sem rolagem horizontal", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")
        const { opener } = await getFirstEntryOpener(page, "pt-BR")
        const box = getDialog(page)

        for (const width of [360, 390, 639, 640, 768, 1280]) {
            await page.setViewportSize({ width, height: 800 })
            await opener.scrollIntoViewIfNeeded()
            await opener.click()
            await expect(box).toBeVisible()

            const rect = await getBox(box)
            if (width < DESKTOP_MIN_WIDTH) {
                expect(rect.width).toBe(await readContentWidth(page))
                expect(rect.height).toBe(800)
            } else {
                expect(rect.width).toBeLessThanOrEqual(MODAL_MAX_WIDTH)
                expect(rect.width).toBeLessThan(width)
            }
            expect(
                await page.evaluate(
                    () =>
                        document.documentElement.scrollWidth <= document.documentElement.clientWidth
                )
            ).toBe(true)

            await page.keyboard.press("Escape")
            await expect(box).toHaveCount(0)
        }
    })

    test("A11Y-G03, A11Y-G04: sem violação do axe com o modal aberto", async ({ page }) => {
        await openAbout(page, "pt-BR")
        const { opener } = await getFirstEntryOpener(page, "pt-BR")
        await opener.click()
        await expect(getDialog(page)).toBeVisible()

        const { violations } = await new AxeBuilder({ page }).analyze()

        expect(violations.map((violation) => violation.id)).toEqual([])
    })
})

test.describe("carregamento e erro", () => {
    test("RF-ABOUT-25, A11Y-G13: carregando mostra h1, títulos e botões e um único status, e o conteúdo chega depois", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"].aboutPage
        const about = readAbout("pt-BR")
        const releaseProfile = await holdContent(page, "pt-BR", "profile")
        const releaseTimeline = await holdContent(page, "pt-BR", "timeline")

        await openAboutFromHeader(page, "pt-BR")

        const main = page.getByRole("main")
        const loadingStatus = page
            .getByRole("status")
            .filter({ hasText: UI_TEXTS["pt-BR"].loading })
        await expect(loadingStatus).toHaveCount(1)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(texts.heading)
        await expect(main.getByRole("heading", { level: 2, name: texts.aboutMe })).toBeVisible()
        await expect(main.getByRole("link", { name: texts.resumeName })).toBeVisible()
        await expect(main.getByRole("link", { name: UI_TEXTS["pt-BR"].contactCta })).toBeVisible()
        await expect(main.getByText(about.summary, { exact: true })).toHaveCount(0)
        await expect(page.locator('main [aria-hidden="true"]').first()).toBeAttached()

        releaseProfile()
        releaseTimeline()

        await expect(main.getByText(about.summary, { exact: true })).toBeVisible()
        await expect(loadingStatus).toHaveCount(0)
        await expect(getTrajectoryItem(page, about.entries[0].highlight)).toBeVisible()
    })

    test("RF-ABOUT-26, A11Y-G14: erro do perfil mostra um alerta e Tentar novamente refaz só o perfil e devolve o foco ao h1", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"].aboutPage
        const about = readAbout("pt-BR")
        let timelineRequests = 0
        page.on("request", (request) => {
            if (request.url().endsWith("/content/pt-BR/timeline.json")) {
                timelineRequests += 1
            }
        })
        await page.route("**/content/pt-BR/profile.json", (route) => route.abort())

        await openAboutFromHeader(page, "pt-BR")

        const alerts = page.getByRole("alert")
        await expect(alerts).toHaveCount(1)
        await expect(alerts).toContainText(texts.loadErrorMessage)
        await expect(page.getByRole("button", { name: texts.retry }).first()).toBeVisible()
        await expect(
            page.getByRole("status").filter({ hasText: UI_TEXTS["pt-BR"].loading })
        ).toHaveCount(0)
        await expect(getTrajectoryItem(page, about.entries[0].highlight)).toBeVisible()
        const timelineBefore = timelineRequests
        await page.unroute("**/content/pt-BR/profile.json")

        await page.getByRole("button", { name: texts.retry }).first().click()

        await expect(page.getByRole("main").getByText(about.summary, { exact: true })).toBeVisible()
        await expect(page.getByRole("alert")).toHaveCount(0)
        await expect(page.getByRole("heading", { level: 1 })).toBeFocused()
        expect(timelineRequests).toBe(timelineBefore)
    })

    test("RF-ABOUT-26, A11Y-G14: erro da trajetória mostra um alerta e Tentar novamente refaz só a trajetória e devolve o foco ao título", async ({
        page
    }) => {
        const texts = UI_TEXTS["pt-BR"].aboutPage
        const about = readAbout("pt-BR")
        let profileRequests = 0
        page.on("request", (request) => {
            if (request.url().endsWith("/content/pt-BR/profile.json")) {
                profileRequests += 1
            }
        })
        await page.route("**/content/pt-BR/timeline.json", (route) => route.abort())

        await openAboutFromHeader(page, "pt-BR")

        await expect(page.getByRole("alert")).toHaveCount(1)
        await expect(page.getByRole("alert")).toContainText(texts.loadErrorMessage)
        await expect(page.getByRole("main").getByText(about.summary, { exact: true })).toBeVisible()
        const profileBefore = profileRequests
        await page.unroute("**/content/pt-BR/timeline.json")

        await page.getByRole("button", { name: texts.retry }).first().click()

        await expect(getTrajectoryItem(page, about.entries[0].highlight)).toBeVisible()
        await expect(page.getByRole("alert")).toHaveCount(0)
        await expect(page.getByRole("heading", { level: 2, name: texts.trajectory })).toBeFocused()
        expect(profileRequests).toBe(profileBefore)
    })

    for (const language of ["en", "es"] as const) {
        test(`RF-ABOUT-26, A11Y-G15: em ${language} a mensagem de erro e o botão estão traduzidos`, async ({
            page
        }) => {
            const texts = UI_TEXTS[language].aboutPage
            await page.route(`**/content/${language}/profile.json`, (route) => route.abort())

            await openAboutFromHeader(page, language)

            await expect(page.getByRole("alert")).toContainText(texts.loadErrorMessage)
            await expect(page.getByRole("button", { name: texts.retry }).first()).toBeVisible()
        })
    }
})

test.describe("idioma", () => {
    test("RF-ABOUT-24, NF-IN-11: trocar o idioma no cabeçalho mantém a rota, o conteúdo e o lang", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")

        await chooseLanguageInHeader(page, "pt-BR", "en")

        await expect(page).toHaveURL(/\/en\/about$/)
        await expect(page.locator("html")).toHaveAttribute("lang", "en")
        await expect(page).toHaveTitle(UI_TEXTS.en.aboutPage.title)
        await expect(
            page.getByRole("heading", { level: 2, name: UI_TEXTS.en.aboutPage.aboutMe })
        ).toBeVisible()
        await expect(
            page.getByRole("main").getByText(readAbout("en").summary, { exact: true })
        ).toBeVisible()
    })
})

test.describe("revelar ao rolar com movimento pleno", () => {
    test.use({ reducedMotion: "no-preference" })

    test("RF-ABOUT-01, A11Y-G12: a Trajetória começa escondida e entra ao rolar", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")
        const heading = page.getByRole("heading", {
            level: 2,
            name: UI_TEXTS["pt-BR"].aboutPage.trajectory
        })
        const wrapper = page.locator("[data-reveal]").filter({ has: heading })
        await expect(wrapper).toHaveAttribute("data-reveal", "hidden")

        await heading.scrollIntoViewIfNeeded()

        await expect(wrapper).toHaveAttribute("data-reveal", "visible")
    })
})

test.describe("movimento reduzido", () => {
    test.use({ reducedMotion: "reduce" })

    test("RF-ABOUT-01, A11Y-G12, NF-MO-01: com movimento reduzido todas as seções ficam visíveis sem rolar", async ({
        page
    }) => {
        await openAbout(page, "pt-BR")

        const wrappers = page.locator("[data-reveal]")
        expect(await wrappers.count()).toBeGreaterThan(0)
        for (const wrapper of await wrappers.all()) {
            await expect(wrapper).toHaveAttribute("data-reveal", "visible")
        }
    })
})

test.describe("foto", () => {
    for (const language of LANGUAGES) {
        test(`RF-ABOUT-02: em ${language} a foto aparece como imagem com o nome da foto e carregada`, async ({
            page
        }) => {
            await openAbout(page, language)
            const photo = page.getByRole("img", { name: UI_TEXTS[language].aboutPage.photoAlt })

            await expect(photo).toBeVisible()
            await expect(photo).toHaveJSProperty("tagName", "IMG")
            await expect
                .poll(() => photo.evaluate((element: HTMLImageElement) => element.naturalWidth))
                .toBeGreaterThan(0)
        })
    }
})
