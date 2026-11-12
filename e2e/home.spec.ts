import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import UI_TEXTS from "./support/uiTexts"

const HIT_MIN = 44
const BREAKPOINT_WIDTH = 640
const LANGUAGES = ["pt-BR", "en", "es"] as const
const STACK_HEADING = "Tecnologias que uso"
const DRAG_DISTANCE = 300

function getStackBand(page: Page) {
    return page.getByRole("region", { name: STACK_HEADING })
}

test.describe("movimento pleno", () => {
    test.use({ reducedMotion: "no-preference" })

    test.beforeEach(async ({ page }) => {
        await page.goto("pt-BR")
        await page.getByRole("heading", { level: 1 }).waitFor()
    })

    test("RF-HOME-06, RF-HOME-22: os links principais têm alvo de 44px", async ({ page }) => {
        const targets = [
            page.getByRole("link", { name: /Ver projetos/ }),
            page.getByRole("link", { name: "Baixar CV (PDF), abre a pré-visualização" }),
            page.getByRole("link", { name: "Ler sobre mim" })
        ]

        for (const target of targets) {
            const box = await target.boundingBox()
            expect(box?.height ?? 0).toBeGreaterThanOrEqual(HIT_MIN)
            expect(box?.width ?? 0).toBeGreaterThanOrEqual(HIT_MIN)
        }
    })
})

test.describe("faixa de tecnologias com movimento pleno", () => {
    test.use({ reducedMotion: "no-preference" })

    test.beforeEach(async ({ page }) => {
        await page.goto("pt-BR")
        await getStackBand(page).waitFor()
    })

    test("RF-HOME-14: não tem botão de pausa e a região é focável por teclado", async ({
        page
    }) => {
        await expect(page.getByRole("button", { name: /paus/i })).toHaveCount(0)
        await expect(getStackBand(page)).toHaveAttribute("tabindex", "0")
    })

    test("RF-HOME-12, RF-HOME-14: tem uma cópia escondida da lista para o ciclo contínuo", async ({
        page
    }) => {
        await expect(getStackBand(page).locator("ul[aria-hidden='true']")).toHaveCount(1)
    })
})

test.describe("faixa de tecnologias com movimento reduzido", () => {
    test.use({ reducedMotion: "reduce" })

    test.beforeEach(async ({ page }) => {
        await page.goto("pt-BR")
        await expect(getStackBand(page)).toHaveAttribute("tabindex", "0")
    })

    test("RF-HOME-15: não tem cópia escondida da lista", async ({ page }) => {
        await expect(getStackBand(page).locator("[aria-hidden='true']")).toHaveCount(0)
    })

    test("RF-HOME-15: rola na horizontal ao arrastar com o mouse", async ({ page }) => {
        const band = getStackBand(page)
        await band.scrollIntoViewIfNeeded()

        await expect
            .poll(async () => {
                const box = await band.boundingBox()
                if (!box) {
                    return 0
                }
                const y = box.y + box.height / 2
                await page.mouse.move(box.x + box.width - 100, y)
                await page.mouse.down()
                await page.mouse.move(box.x + box.width - 100 - DRAG_DISTANCE, y, { steps: 8 })
                await page.mouse.up()
                return band.evaluate((element) => element.scrollLeft)
            })
            .toBeGreaterThan(0)
    })

    test("RF-HOME-15: rola na horizontal com as setas quando focada", async ({ page }) => {
        const band = getStackBand(page)
        await band.scrollIntoViewIfNeeded()
        await band.focus()
        await expect(band).toBeFocused()

        await page.keyboard.press("ArrowRight")
        await page.keyboard.press("ArrowRight")

        await expect.poll(() => band.evaluate((element) => element.scrollLeft)).toBeGreaterThan(0)
    })
})

test.describe("entrada dos destaques ao rolar", () => {
    test.describe("com movimento reduzido", () => {
        test.use({ reducedMotion: "reduce" })

        test("RF-HOME-22: todos já aparecem visíveis", async ({ page }) => {
            await page.goto("pt-BR")
            await page.getByRole("article").first().waitFor()

            const states = await page
                .locator("[data-reveal]")
                .evaluateAll((elements) =>
                    elements.map((element) => element.getAttribute("data-reveal"))
                )
            expect(states.length).toBeGreaterThan(0)
            expect(new Set(states)).toEqual(new Set(["visible"]))
        })
    })

    test.describe("com movimento pleno", () => {
        test.use({ reducedMotion: "no-preference" })

        test("RF-HOME-22: o destaque fora da tela começa escondido e aparece ao rolar até ele", async ({
            page
        }) => {
            await page.goto("pt-BR")
            const items = page.getByRole("article")
            await items.first().waitFor()
            const last = items.last()

            await expect(last).toHaveAttribute("data-reveal", "hidden")
            await last.scrollIntoViewIfNeeded()
            await expect(last).toHaveAttribute("data-reveal", "visible")
        })
    })
})

test.describe("menu de configurações", () => {
    test("RF-LAY-18, RF-LAY-35: separa preferências e acessibilidade em grupos com nome", async ({
        page
    }) => {
        test.skip(
            (page.viewportSize()?.width ?? 0) < BREAKPOINT_WIDTH,
            "o menu existe só no desktop"
        )
        await page.goto("pt-BR")
        await page.getByRole("heading", { level: 1 }).waitFor()
        await page.getByRole("button", { name: "Configurações" }).click()

        const preferences = page.getByRole("group", { name: "Preferências" })
        const accessibility = page.getByRole("group", { name: "Acessibilidade" })
        await expect(preferences.getByRole("button", { name: "Tema escuro" })).toBeVisible()
        await expect(accessibility.getByRole("button", { name: "Reduzir movimento" })).toBeVisible()
        await expect(page.getByRole("group")).toHaveCount(2)
    })
})

test.describe("carga da página", () => {
    for (const language of LANGUAGES) {
        test(`RF-HOME-01: não registra erro no console em ${language}`, async ({ page }) => {
            const problems: string[] = []
            page.on("console", (message) => {
                if (message.type() === "error" || message.type() === "warning") {
                    problems.push(`${message.type()}: ${message.text()}`)
                }
            })
            page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`))

            await page.goto(language)
            await page.getByRole("heading", { level: 1 }).waitFor()
            await expect(page.getByRole("article").first()).toBeVisible()
            await page.waitForLoadState("networkidle")

            expect(problems).toEqual([])
        })
    }
})

test.describe("estrutura da página", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("pt-BR")
        await page.getByRole("heading", { level: 1 }).waitFor()
    })

    test("RF-HOME-20: os destaques alternam a imagem a partir de 640px", async ({ page }) => {
        const items = page.getByRole("article")
        await expect(items.first()).toBeVisible()
        const count = await items.count()
        test.skip(count < 2, "o conteúdo tem menos de dois destaques")

        const positions = []
        for (let index = 0; index < 2; index++) {
            const item = items.nth(index)
            const image = await item.locator("img, [aria-hidden='true']").first().boundingBox()
            const title = await item.getByRole("heading", { level: 3 }).boundingBox()
            positions.push({ image, title })
        }

        const isWide = (page.viewportSize()?.width ?? 0) >= BREAKPOINT_WIDTH
        const [first, second] = positions

        if (isWide) {
            expect(first.image?.x ?? 0).toBeLessThan(first.title?.x ?? 0)
            expect(second.image?.x ?? 0).toBeGreaterThan(second.title?.x ?? 0)
        } else {
            expect(first.image?.y ?? 0).toBeLessThan(first.title?.y ?? 0)
            expect(second.image?.y ?? 0).toBeLessThan(second.title?.y ?? 0)
        }
    })

    test("RF-HOME-19: cada destaque tem um único link, no título", async ({ page }) => {
        const items = page.getByRole("article")
        await expect(items.first()).toBeVisible()

        for (let index = 0; index < (await items.count()); index++) {
            await expect(items.nth(index).getByRole("link")).toHaveCount(1)
        }
    })

    test("RF-HOME-16, RF-HOME-22: os links de saída e do cabeçalho da seção têm alvo de 44px", async ({
        page
    }) => {
        const links = page.getByRole("link", { name: "Ver todos os projetos" })

        for (let index = 0; index < (await links.count()); index++) {
            const box = await links.nth(index).boundingBox()
            expect(box?.height ?? 0).toBeGreaterThanOrEqual(HIT_MIN)
        }
    })
})

const NARROWEST_WIDTH = 320
const FEATURED_TARGET_WIDTHS = [NARROWEST_WIDTH, 375, 390, 768] as const
const COVER_WIDTHS = [375, 1280] as const
const MEDIA_RATIO = 16 / 9
const RATIO_TOLERANCE = 0.01
const MAX_TAB_PRESSES = 80

function targetWidths(projectWidth: number) {
    return [...FEATURED_TARGET_WIDTHS, projectWidth].filter(
        (width, index, all) => all.indexOf(width) === index
    )
}

function getFeaturedTitleLinks(page: Page) {
    return page.getByRole("article").getByRole("heading", { level: 3 }).getByRole("link")
}

function hasHorizontalScroll(page: Page) {
    return page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth
    )
}

async function setWidth(page: Page, width: number) {
    await page.setViewportSize({ width, height: 800 })
    await expect.poll(() => page.evaluate(() => window.innerWidth)).toBe(width)
}

async function measureFocusedTitleLink(page: Page) {
    return page.evaluate(() => {
        const active = document.activeElement
        if (!(active instanceof HTMLAnchorElement) || !active.closest("article h3")) {
            return null
        }
        const style = getComputedStyle(active)
        const reach = parseFloat(style.outlineWidth) + parseFloat(style.outlineOffset)
        const box = active.getBoundingClientRect()
        const ring = {
            left: box.left - reach,
            right: box.right + reach,
            top: box.top - reach,
            bottom: box.bottom + reach
        }
        const clippers = []
        for (let ancestor = active.parentElement; ancestor; ancestor = ancestor.parentElement) {
            const ancestorStyle = getComputedStyle(ancestor)
            const clips =
                ancestorStyle.overflowX !== "visible" ||
                ancestorStyle.overflowY !== "visible" ||
                ancestorStyle.clipPath !== "none" ||
                ancestorStyle.maskImage !== "none"
            if (clips && ancestor !== document.documentElement && ancestor !== document.body) {
                const area = ancestor.getBoundingClientRect()
                if (
                    ring.left < area.left - 0.5 ||
                    ring.right > area.right + 0.5 ||
                    ring.top < area.top - 0.5 ||
                    ring.bottom > area.bottom + 0.5
                ) {
                    clippers.push(ancestor.tagName)
                }
            }
        }
        return {
            text: active.textContent,
            focusVisible: active.matches(":focus-visible"),
            outlineStyle: style.outlineStyle,
            outlineWidth: parseFloat(style.outlineWidth),
            insideViewport:
                ring.left >= -0.5 && ring.right <= document.documentElement.clientWidth + 0.5,
            clippers
        }
    })
}

test.describe("alvo do título dos destaques", () => {
    for (const language of LANGUAGES) {
        test(`RF-HOME-19, A11Y-G08, NF-RE-03: em ${language} o link de título de cada destaque tem 44px, a linha do título não cresce e a página não rola na horizontal em 320, 375, 390, 768px e na largura do projeto, com o título mais longo em duas linhas a 320px (depende do conteúdo atual)`, async ({
            page,
            colorScheme
        }) => {
            test.skip(colorScheme === "dark", "o tema não muda a geometria")
            test.slow()
            await page.goto(language)
            await page.getByRole("article").last().waitFor()
            const projectWidth = page.viewportSize()?.width ?? 0
            const links = getFeaturedTitleLinks(page)
            const total = await links.count()
            expect(total).toBeGreaterThan(0)

            for (const width of targetWidths(projectWidth)) {
                await setWidth(page, width)
                let tallestLines = 0

                for (let index = 0; index < total; index++) {
                    const label = `${width}px, destaque ${index + 1}`
                    const link = links.nth(index)
                    const box = await link.boundingBox()
                    expect(box?.height ?? 0, label).toBeGreaterThanOrEqual(HIT_MIN)
                    const measures = await link.evaluate((element) => {
                        const range = document.createRange()
                        range.selectNodeContents(element)
                        const lineTops = new Set(
                            [...range.getClientRects()].map((rect) => Math.round(rect.top))
                        )
                        const heading = element.closest("h3")
                        return {
                            lines: lineTops.size,
                            lineHeight: heading
                                ? parseFloat(getComputedStyle(heading).lineHeight)
                                : 0,
                            heading: heading?.getBoundingClientRect().height ?? 0
                        }
                    })
                    tallestLines = Math.max(tallestLines, measures.lines)

                    expect(measures.lineHeight, label).toBeGreaterThan(0)
                    expect(
                        Math.abs(measures.heading - measures.lines * measures.lineHeight),
                        label
                    ).toBeLessThanOrEqual(1)
                }

                if (width === NARROWEST_WIDTH) {
                    expect(tallestLines, `${width}px`).toBeGreaterThan(1)
                }
                expect(await hasHorizontalScroll(page), `${width}px`).toBe(false)
            }
        })

        test(`RF-HOME-19, A11Y-G06, A11Y-G08: em ${language} o foco por Tab no título de cada destaque mostra o contorno inteiro em 320, 375, 390, 768px e na largura do projeto`, async ({
            page,
            colorScheme
        }) => {
            test.skip(colorScheme === "dark", "o tema não muda a geometria")
            test.slow()
            await page.goto(language)
            await page.getByRole("article").last().waitFor()
            const projectWidth = page.viewportSize()?.width ?? 0
            const total = await getFeaturedTitleLinks(page).count()
            expect(total).toBeGreaterThan(0)

            for (const width of targetWidths(projectWidth)) {
                await setWidth(page, width)
                await page.getByRole("heading", { level: 1 }).click()

                const focused = []
                for (let press = 0; press < MAX_TAB_PRESSES && focused.length < total; press++) {
                    await page.keyboard.press("Tab")
                    const measure = await measureFocusedTitleLink(page)
                    if (measure) {
                        focused.push(measure)
                    }
                }

                expect(focused, `${width}px`).toHaveLength(total)
                for (const measure of focused) {
                    const label = `${width}px, ${measure.text}`
                    expect(measure.focusVisible, label).toBe(true)
                    expect(measure.outlineStyle, label).not.toBe("none")
                    expect(measure.outlineWidth, label).toBeGreaterThan(0)
                    expect(measure.insideViewport, label).toBe(true)
                    expect(measure.clippers, label).toEqual([])
                }
            }
        })
    }
})

test.describe("proporção das capas dos destaques", () => {
    for (const language of LANGUAGES) {
        test(`RF-HOME-21, NF-DE-16: em ${language} a capa de cada destaque é 16:9 em 375 e 1280px`, async ({
            page,
            colorScheme
        }) => {
            test.skip(colorScheme === "dark", "o tema não muda a geometria")
            test.slow()
            await page.goto(language)
            await page.getByRole("article").last().waitFor()
            const images = page.getByRole("article").locator("img")
            const total = await images.count()
            expect(total).toBeGreaterThan(0)

            for (const width of COVER_WIDTHS) {
                await setWidth(page, width)

                for (let index = 0; index < total; index++) {
                    const label = `${width}px, capa ${index + 1}`
                    const image = images.nth(index)
                    await image.scrollIntoViewIfNeeded()
                    await expect
                        .poll(() =>
                            image.evaluate(
                                (element: HTMLImageElement) =>
                                    element.complete && element.naturalWidth > 0
                            )
                        )
                        .toBe(true)
                    const measures = await image.evaluate((element: HTMLImageElement) => {
                        const box = element.getBoundingClientRect()
                        return {
                            width: box.width,
                            height: box.height,
                            naturalRatio: element.naturalWidth / element.naturalHeight,
                            attributeRatio:
                                Number(element.getAttribute("width")) /
                                Number(element.getAttribute("height"))
                        }
                    })

                    expect(
                        Math.abs(measures.height - (measures.width * 9) / 16),
                        label
                    ).toBeLessThanOrEqual(1)
                    expect(
                        Math.abs(measures.width / measures.height - MEDIA_RATIO),
                        label
                    ).toBeLessThanOrEqual(RATIO_TOLERANCE)
                    expect(
                        Math.abs(measures.naturalRatio - MEDIA_RATIO),
                        label
                    ).toBeLessThanOrEqual(RATIO_TOLERANCE)
                    expect(
                        Math.abs(measures.attributeRatio - MEDIA_RATIO),
                        label
                    ).toBeLessThanOrEqual(RATIO_TOLERANCE)
                }
            }
        })
    }
})

test.describe("imagens dos destaques", () => {
    for (const language of LANGUAGES) {
        test(`RF-HOME-21: em ${language} cada destaque mostra a imagem carregada e nenhum placeholder`, async ({
            page
        }) => {
            await page.goto(language)
            await page.getByRole("heading", { level: 1 }).waitFor()
            const items = page.getByRole("article")
            const total = await items.count()
            expect(total).toBeGreaterThan(0)

            for (let index = 0; index < total; index++) {
                const item = items.nth(index)
                const image = item.locator("img")
                await image.scrollIntoViewIfNeeded()
                await expect(image).toHaveCount(1)
                await expect
                    .poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth))
                    .toBeGreaterThan(0)
                await expect(item.locator("div[aria-hidden='true']")).toHaveCount(0)
            }
        })
    }
})

test.describe("cargo declarado", () => {
    for (const language of LANGUAGES) {
        const texts = UI_TEXTS[language]

        test(`RF-HOME-26, RF-HOME-27: em ${language} o h1 é o cargo e a linha da stack vem logo abaixo`, async ({
            page
        }) => {
            await page.goto(language)

            const heading = page.getByRole("heading", { level: 1 })
            await expect(heading).toHaveText(texts.homeHeading)
            await expect(heading.locator("xpath=following-sibling::p[1]")).toHaveText(
                texts.homeStack
            )
        })

        test(`RF-HOME-26: em ${language} o title e a description da Início usam o cargo`, async ({
            page
        }) => {
            await page.goto(language)
            await page.getByRole("heading", { level: 1 }).waitFor()

            await expect(page).toHaveTitle(texts.homeTitle)
            await expect(page.locator('meta[name="description"]')).toHaveAttribute(
                "content",
                texts.homeDescription
            )
            await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
                "content",
                texts.homeDescription
            )
        })

        test(`RF-HOME-26: em ${language} o jobTitle do JSON-LD da Início é igual ao de Informações`, async ({
            page
        }) => {
            await page.goto(language)
            await page.getByRole("heading", { level: 1 }).waitFor()
            const home = JSON.parse(
                (await page.locator('script[type="application/ld+json"]').textContent()) ?? "null"
            )
            await page.goto(`${language}/about`)
            await page.getByRole("heading", { level: 1 }).waitFor()
            const about = JSON.parse(
                (await page.locator('script[type="application/ld+json"]').textContent()) ?? "null"
            )

            expect(home["@graph"][1].jobTitle).toBe(texts.homeHeading)
            expect(about.mainEntity.jobTitle).toBe(home["@graph"][1].jobTitle)
        })
    }
})

const STAGING_FEATURED_Y = { "pt-BR": 1093, en: 1120, es: 1091 } as const
const MAX_HIGHLIGHT_LINES = 3
const CARD_BREAKPOINT = 640

test.describe("cartões de status no celular", () => {
    for (const width of [375, 390]) {
        for (const language of LANGUAGES) {
            test(`RF-HOME-28, NF-RE-03: a ${width}px em ${language} o destaque de cada cartão tem no máximo ${MAX_HIGHLIGHT_LINES} linhas, a página não rola na horizontal e Projetos em destaque não desce`, async ({
                page
            }) => {
                await page.setViewportSize({ width, height: 800 })
                await page.goto(language)
                await page.getByRole("article").last().waitFor()

                const measures = await page.evaluate(() =>
                    [...document.querySelectorAll("time")].map((time) => {
                        const highlight = time.closest("div")?.querySelectorAll("p")[1]
                        const style = highlight ? getComputedStyle(highlight) : null

                        return {
                            height: highlight?.getBoundingClientRect().height ?? 0,
                            lineHeight: Number.parseFloat(style?.lineHeight ?? "0"),
                            fontSize: style?.fontSize
                        }
                    })
                )
                const featured = await page
                    .getByRole("heading", { level: 2, name: UI_TEXTS[language].featuredHeading })
                    .evaluate((heading) => heading.getBoundingClientRect().top + window.scrollY)
                const overflow = await page.evaluate(
                    () =>
                        document.documentElement.scrollWidth > document.documentElement.clientWidth
                )

                expect(measures.length).toBeGreaterThan(0)
                for (const measure of measures) {
                    expect(measure.fontSize).toBe("14px")
                    expect(measure.height).toBeLessThanOrEqual(
                        MAX_HIGHLIGHT_LINES * measure.lineHeight + 1
                    )
                }
                expect(overflow).toBe(false)
                expect(featured).toBeLessThanOrEqual(STAGING_FEATURED_Y[language])
            })
        }
    }

    test("RF-HOME-28: a 640px o cartão mantém o padding e o destaque de 18px", async ({ page }) => {
        await page.setViewportSize({ width: CARD_BREAKPOINT, height: 800 })
        await page.goto("pt-BR")
        await page.getByRole("article").last().waitFor()

        const style = await page.evaluate(() => {
            const card = document.querySelector("time")?.closest("div")
            const highlight = card?.querySelectorAll("p")[1]

            return {
                padding: card ? getComputedStyle(card).paddingTop : null,
                fontSize: highlight ? getComputedStyle(highlight).fontSize : null
            }
        })

        expect(style).toEqual({ padding: "20px", fontSize: "18px" })
    })
})
