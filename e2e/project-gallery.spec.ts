import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import collectConsoleProblems from "./support/collectConsoleProblems"
import expectNoAxeViolations from "./support/expectNoAxeViolations"
import navigateClientSide from "./support/navigateClientSide"
import openProject from "./support/openProject"
import PROJECT_TEXTS from "./support/projectTexts"
import projectPath from "./support/projectPath"
import readProjectDetail from "./support/readProjectDetail"
import serveProjectFixture from "./support/serveProjectFixture"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const MNIST = "MNIST Classifier"
const IMAGES = 4
const TOUCH_TARGET = 44
const MOBILE_THUMBNAILS_MAX = 640

type Language = (typeof LANGUAGES)[number]

async function openProjectWithImages(
    page: Page,
    language: Language,
    imageCount: number,
    afterProbe?: () => void
) {
    const project = readProjectDetail(language, MNIST)
    await page.goto(`${language}/rota-inexistente`)
    await page.getByRole("heading", { level: 1 }).waitFor()
    afterProbe?.()
    const fixture = await serveProjectFixture(page, {
        language,
        projectId: project.id,
        imageCount,
        relatedCount: 0
    })
    await navigateClientSide(page, projectPath(language, project.id))
    await page.getByRole("heading", { level: 1, name: project.title }).waitFor()
    return { project, images: fixture.images }
}

function mainButton(page: Page, language: Language) {
    return page
        .getByRole("region", { name: PROJECT_TEXTS[language].gallery })
        .getByRole("button", { name: new RegExp(`${PROJECT_TEXTS[language].enlarge}$`) })
}

function lightbox(page: Page, language: Language) {
    return page.getByRole("dialog", { name: PROJECT_TEXTS[language].lightbox })
}

test.describe("galeria", () => {
    test("RF-PROJECT-05, RF-PROJECT-04: com uma imagem não há contador nem miniaturas e o botão ampliar existe", async ({
        page
    }) => {
        const project = await openProject(page, "pt-BR", MNIST)
        const texts = PROJECT_TEXTS["pt-BR"]
        const gallery = page.getByRole("region", { name: texts.gallery })

        await expect(mainButton(page, "pt-BR")).toBeVisible()
        await expect(gallery.getByRole("img", { name: project.images[0].alt })).toBeVisible()
        await expect(gallery.getByText(project.images[0].caption)).toBeVisible()
        await expect(gallery.getByRole("group", { name: texts.thumbnails })).toHaveCount(0)
        await expect(gallery.getByText(texts.counter(1, 1))).toHaveCount(0)
    })

    test("RF-PROJECT-07, NF-DE-13: a imagem principal tem fetchpriority alta, sem lazy e com dimensões; a variante grande só é pedida com a lightbox", async ({
        page
    }) => {
        const requested: string[] = []
        page.on("request", (request) => requested.push(request.url()))
        const project = await openProject(page, "pt-BR", MNIST)
        const image = page
            .getByRole("region", { name: PROJECT_TEXTS["pt-BR"].gallery })
            .getByRole("img")

        await expect(image).toHaveAttribute("fetchpriority", "high")
        await expect(image).not.toHaveAttribute("loading", "lazy")
        await expect(image).toHaveAttribute("width", /\d+/)
        await expect(image).toHaveAttribute("height", /\d+/)
        expect(requested.some((url) => url.endsWith(project.images[0].large))).toBe(false)

        await mainButton(page, "pt-BR").click()
        await expect(lightbox(page, "pt-BR")).toBeVisible()

        await expect
            .poll(() => requested.some((url) => url.endsWith(project.images[0].large)))
            .toBe(true)
    })

    test("RF-PROJECT-05: com cinco imagens a galeria completa e com quatro mostra quatro miniaturas", async ({
        page
    }) => {
        const { images } = await openProjectWithImages(page, "pt-BR", IMAGES)
        const texts = PROJECT_TEXTS["pt-BR"]
        const gallery = page.getByRole("region", { name: texts.gallery })
        const thumbnails = gallery
            .getByRole("group", { name: texts.thumbnails })
            .getByRole("button")

        await expect(thumbnails).toHaveCount(IMAGES)
        await expect(gallery.getByText(texts.counter(1, IMAGES))).toBeVisible()
        await expect(gallery.getByText(images[0].caption)).toBeVisible()
    })

    for (const language of LANGUAGES) {
        test(`RF-PROJECT-06, A11Y-PJ03: em ${language} as miniaturas têm nome Imagem N de M, aria-current na ativa e trocam imagem, legenda e contador sem mover o foco`, async ({
            page
        }) => {
            const { images } = await openProjectWithImages(page, language, IMAGES)
            const texts = PROJECT_TEXTS[language]
            const gallery = page.getByRole("region", { name: texts.gallery })
            const group = gallery.getByRole("group", { name: texts.thumbnails })

            for (let index = 0; index < IMAGES; index++) {
                await expect(
                    group.getByRole("button", { name: texts.thumbnail(index + 1, IMAGES) })
                ).toHaveCount(1)
            }
            const second = group.getByRole("button", { name: texts.thumbnail(2, IMAGES) })
            await expect(
                group.getByRole("button", { name: texts.thumbnail(1, IMAGES) })
            ).toHaveAttribute("aria-current", "true")

            await second.focus()
            await page.keyboard.press("Enter")

            await expect(second).toHaveAttribute("aria-current", "true")
            await expect(second).toBeFocused()
            await expect(gallery.getByText(images[1].caption)).toBeVisible()
            await expect(gallery.getByText(texts.counter(2, IMAGES))).toBeVisible()
            await expect(gallery.getByRole("img", { name: images[1].alt }).first()).toBeVisible()
            await expect(group.locator("[aria-current]")).toHaveCount(1)
        })
    }

    test("RF-PROJECT-06: a partir de 640px as miniaturas ocupam um quinto da largura alinhadas à esquerda e abaixo disso rolam na horizontal", async ({
        page
    }) => {
        await openProjectWithImages(page, "pt-BR", 5)
        const texts = PROJECT_TEXTS["pt-BR"]
        const gallery = page.getByRole("region", { name: texts.gallery })
        const group = gallery.getByRole("group", { name: texts.thumbnails })
        const buttons = group.getByRole("button")
        const groupBox = await group.boundingBox()
        const first = await buttons.nth(0).boundingBox()
        const third = await buttons.nth(2).boundingBox()
        const wide = (page.viewportSize()?.width ?? 0) >= MOBILE_THUMBNAILS_MAX

        if (wide) {
            const slot = (groupBox?.width ?? 0) / 5
            expect(Math.abs((first?.width ?? 0) - slot)).toBeLessThan(slot * 0.2)
            expect(Math.abs((first?.x ?? 0) - (groupBox?.x ?? 0))).toBeLessThan(6)
            expect((third?.x ?? 0) + (third?.width ?? 0)).toBeLessThan(
                (groupBox?.x ?? 0) + (groupBox?.width ?? 0) * 0.8
            )
            expect(await buttons.count()).toBe(5)
        } else {
            expect(first?.height ?? 0).toBeGreaterThanOrEqual(TOUCH_TARGET)
            expect(Math.abs((first?.width ?? 0) - 104)).toBeLessThan(8)
            const overflow = await group.evaluate(
                (element) => element.scrollWidth - element.clientWidth
            )
            expect(overflow).toBeGreaterThan(0)
        }
    })

    test("RF-PROJECT-04: sem captura o projeto mostra o placeholder decorativo, sem galeria nem botão", async ({
        page
    }) => {
        const { project } = await openProjectWithImages(page, "pt-BR", 0)
        const texts = PROJECT_TEXTS["pt-BR"]

        await expect(page.getByRole("region", { name: texts.gallery })).toHaveCount(0)
        await expect(page.getByRole("button", { name: new RegExp(texts.enlarge) })).toHaveCount(0)
        await expect(page.getByRole("heading", { level: 1 })).toHaveText(project.title)
    })

    test("RF-PROJECT-32: imagem que não carrega dá lugar ao placeholder com role img e o alt, mantendo legenda e miniaturas", async ({
        page
    }) => {
        await page.route("**/images/projects/**/*-small.webp", (route) => route.abort())
        const { images } = await openProjectWithImages(page, "pt-BR", 3)
        const texts = PROJECT_TEXTS["pt-BR"]
        const gallery = page.getByRole("region", { name: texts.gallery })

        await expect(gallery.getByRole("img", { name: images[0].alt })).toBeVisible()
        await expect(gallery.locator("img")).toHaveCount(0)
        await expect(gallery.getByText(images[0].caption)).toBeVisible()
        await expect(
            gallery.getByRole("group", { name: texts.thumbnails }).getByRole("button")
        ).toHaveCount(3)
    })
})

test.describe("lightbox", () => {
    for (const language of LANGUAGES) {
        test(`RF-PROJECT-08, RF-PROJECT-09: em ${language} a lightbox abre com foco em Fechar, nome do diálogo, barra com legenda e contador`, async ({
            page
        }) => {
            const { images } = await openProjectWithImages(page, language, IMAGES)
            const texts = PROJECT_TEXTS[language]

            await mainButton(page, language).click()

            const dialog = lightbox(page, language)
            await expect(dialog).toBeVisible()
            await expect(dialog).toHaveAttribute("aria-modal", "true")
            await expect(dialog.getByRole("button", { name: texts.close })).toBeFocused()
            await expect(dialog).toContainText(images[0].caption)
            await expect(dialog).toContainText(texts.counter(1, IMAGES))
            await expect(dialog.getByRole("img", { name: images[0].alt })).toBeVisible()
            await expect(dialog.getByRole("button", { name: texts.previous })).toBeVisible()
            await expect(dialog.getByRole("button", { name: texts.next })).toBeVisible()
            await expect(dialog.locator("[aria-live=polite]")).toContainText(images[0].caption)
        })
    }

    test("RF-PROJECT-09, A11Y-PJ04: as setas trocam de imagem em ciclo e a barra anuncia a nova imagem", async ({
        page
    }) => {
        const { images } = await openProjectWithImages(page, "pt-BR", IMAGES)
        const texts = PROJECT_TEXTS["pt-BR"]
        await mainButton(page, "pt-BR").click()
        const dialog = lightbox(page, "pt-BR")
        await expect(dialog).toBeVisible()

        await page.keyboard.press("ArrowLeft")

        await expect(dialog).toContainText(texts.counter(IMAGES, IMAGES))
        await expect(dialog).toContainText(images[IMAGES - 1].caption)
        await page.keyboard.press("ArrowRight")
        await expect(dialog).toContainText(texts.counter(1, IMAGES))
        await page.keyboard.press("ArrowRight")
        await expect(dialog).toContainText(texts.counter(2, IMAGES))
        await expect(dialog.getByRole("img", { name: images[1].alt })).toBeVisible()
        await dialog.getByRole("button", { name: texts.next }).click()
        await expect(dialog).toContainText(texts.counter(3, IMAGES))
        await dialog.getByRole("button", { name: texts.previous }).click()
        await expect(dialog).toContainText(texts.counter(2, IMAGES))
        await dialog.getByRole("button", { name: texts.previous }).click()
        await dialog.getByRole("button", { name: texts.previous }).click()
        await expect(dialog).toContainText(texts.counter(IMAGES, IMAGES))
        await dialog.getByRole("button", { name: texts.next }).click()
        await expect(dialog).toContainText(texts.counter(1, IMAGES))
    })

    test("RF-PROJECT-09: Tab e Shift+Tab circulam só dentro da lightbox", async ({ page }) => {
        await openProjectWithImages(page, "pt-BR", IMAGES)
        const texts = PROJECT_TEXTS["pt-BR"]
        await mainButton(page, "pt-BR").click()
        const dialog = lightbox(page, "pt-BR")
        await expect(dialog.getByRole("button", { name: texts.close })).toBeFocused()

        const visited: string[] = []
        for (let step = 0; step < 6; step++) {
            await page.keyboard.press("Tab")
            visited.push(
                await page.evaluate(() => {
                    const active = document.activeElement
                    return `${active?.closest("[role=dialog]") ? "dentro" : "fora"}:${active?.getAttribute("aria-label") ?? active?.textContent ?? ""}`
                })
            )
        }

        expect(visited.every((entry) => entry.startsWith("dentro:"))).toBe(true)
        expect(new Set(visited).size).toBe(3)
        await page.keyboard.press("Shift+Tab")
        expect(
            await page.evaluate(() => Boolean(document.activeElement?.closest("[role=dialog]")))
        ).toBe(true)
    })

    test("RF-PROJECT-09: Esc, Fechar e o clique no fundo fecham e o foco volta ao botão da imagem principal mostrando a última imagem vista", async ({
        page
    }) => {
        const { images } = await openProjectWithImages(page, "pt-BR", IMAGES)
        const texts = PROJECT_TEXTS["pt-BR"]
        const gallery = page.getByRole("region", { name: texts.gallery })
        const dialog = lightbox(page, "pt-BR")

        await mainButton(page, "pt-BR").click()
        await page.keyboard.press("ArrowRight")
        await page.keyboard.press("ArrowRight")
        await page.keyboard.press("Escape")

        await expect(dialog).toHaveCount(0)
        await expect(mainButton(page, "pt-BR")).toBeFocused()
        await expect(gallery.getByText(texts.counter(3, IMAGES))).toBeVisible()
        await expect(gallery.getByRole("img", { name: images[2].alt }).first()).toBeVisible()

        await mainButton(page, "pt-BR").click()
        await dialog.getByRole("button", { name: texts.close }).click()
        await expect(dialog).toHaveCount(0)
        await expect(mainButton(page, "pt-BR")).toBeFocused()

        await mainButton(page, "pt-BR").click()
        await page.mouse.click(4, 4)
        await expect(dialog).toHaveCount(0)
        await expect(mainButton(page, "pt-BR")).toBeFocused()
    })

    test("RF-PROJECT-09, NF-RE-03: com a lightbox aberta o resto da página fica inert, a rolagem travada e sem rolagem horizontal", async ({
        page
    }) => {
        await openProjectWithImages(page, "pt-BR", IMAGES)
        await mainButton(page, "pt-BR").click()
        await expect(lightbox(page, "pt-BR")).toBeVisible()

        await expect(page.locator("#root")).toHaveAttribute("inert", "")
        await expect(page.locator("body")).toHaveAttribute("data-scroll-locked", /.*/)
        const scrollBefore = await page.evaluate(() => window.scrollY)
        await page.mouse.wheel(0, 600)
        await page.mouse.wheel(0, 600)
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollBefore)
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        )
        expect(overflow).toBeLessThanOrEqual(0)

        await page.keyboard.press("Escape")
        await expect(page.locator("#root")).not.toHaveAttribute("inert", "")
        await expect(page.locator("body")).not.toHaveAttribute("data-scroll-locked", /.*/)
    })

    test("RF-PROJECT-09: com uma imagem só não há anterior nem próxima e as setas não fazem nada", async ({
        page
    }) => {
        const project = await openProject(page, "pt-BR", MNIST)
        const texts = PROJECT_TEXTS["pt-BR"]
        await mainButton(page, "pt-BR").click()
        const dialog = lightbox(page, "pt-BR")
        await expect(dialog).toBeVisible()

        await page.keyboard.press("ArrowRight")
        await page.keyboard.press("ArrowLeft")

        await expect(dialog.getByRole("button", { name: texts.previous })).toHaveCount(0)
        await expect(dialog.getByRole("button", { name: texts.next })).toHaveCount(0)
        await expect(dialog).toContainText(project.images[0].caption)
        await expect(dialog.getByRole("img", { name: project.images[0].alt })).toBeVisible()
        await expect(dialog.getByText(texts.counter(1, 1))).toHaveCount(0)
    })

    test("RF-PROJECT-32: na lightbox a imagem que não carrega vira placeholder visível com role img e o alt", async ({
        page
    }) => {
        await page.route("**/images/projects/**/*-large.webp", (route) => route.abort())
        const { images } = await openProjectWithImages(page, "pt-BR", 2)
        await mainButton(page, "pt-BR").click()

        const dialog = lightbox(page, "pt-BR")

        await expect(dialog.locator("img")).toHaveCount(0)
        const placeholder = dialog.getByRole("img", { name: images[0].alt })
        await expect
            .poll(async () => (await placeholder.boundingBox())?.height ?? 0)
            .toBeGreaterThan(50)
        await expect(dialog).toContainText(images[0].caption)
    })

    test("RF-PROJECT-08, A11Y-G12: os botões da lightbox têm alvo de 44px", async ({ page }) => {
        await openProjectWithImages(page, "pt-BR", 3)
        const texts = PROJECT_TEXTS["pt-BR"]
        await mainButton(page, "pt-BR").click()
        const dialog = lightbox(page, "pt-BR")

        for (const name of [texts.close, texts.previous, texts.next]) {
            const box = await dialog.getByRole("button", { name }).boundingBox()
            expect(box?.width ?? 0).toBeGreaterThanOrEqual(TOUCH_TARGET)
            expect(box?.height ?? 0).toBeGreaterThanOrEqual(TOUCH_TARGET)
        }
    })

    test("A11Y-G04, A11Y-G10: a galeria e a lightbox aberta não têm violações do axe", async ({
        page
    }) => {
        await openProjectWithImages(page, "pt-BR", IMAGES)
        await expectNoAxeViolations(page)

        await mainButton(page, "pt-BR").click()
        await expect(lightbox(page, "pt-BR")).toBeVisible()

        await expectNoAxeViolations(page)
    })

    test("RF-PROJECT-35: abrir e fechar a lightbox não gera erro nem aviso no console", async ({
        page
    }) => {
        let problems: string[] = []
        await openProjectWithImages(page, "pt-BR", IMAGES, () => {
            problems = collectConsoleProblems(page)
        })
        await mainButton(page, "pt-BR").click()
        await page.keyboard.press("ArrowRight")
        await page.keyboard.press("Escape")

        expect(problems).toEqual([])
    })
})

test.describe("movimento da lightbox", () => {
    test.use({ reducedMotion: "reduce" })

    test("RF-PROJECT-10, A11Y-G12, NF-MO-01: com movimento reduzido a lightbox não anima", async ({
        page
    }) => {
        await openProjectWithImages(page, "pt-BR", 3)
        await mainButton(page, "pt-BR").click()

        const dialog = lightbox(page, "pt-BR")
        await expect(dialog).toBeVisible()

        const durations = await dialog.evaluate((element) => {
            const nodes = [element, element.parentElement, element.querySelector("img")]
            return nodes.flatMap((node) =>
                node
                    ? [
                          getComputedStyle(node).animationDuration,
                          getComputedStyle(node).transitionDuration
                      ]
                    : []
            )
        })
        for (const value of durations) {
            const seconds = value.split(", ").map((part) => Number.parseFloat(part))
            expect(seconds.every((duration) => Number.isNaN(duration) || duration <= 0.001)).toBe(
                true
            )
        }
    })
})

test.describe("placeholder da lightbox", () => {
    test("RF-PROJECT-32: na lightbox a imagem que não carrega mantém o placeholder com role img e o alt no DOM", async ({
        page
    }) => {
        await page.route("**/images/projects/**/*-large.webp", (route) => route.abort())
        const { images } = await openProjectWithImages(page, "pt-BR", 2)
        await mainButton(page, "pt-BR").click()

        const dialog = lightbox(page, "pt-BR")

        await expect(dialog.getByRole("img", { name: images[0].alt })).toHaveCount(1)
        await expect(dialog.locator("img")).toHaveCount(0)
        await expect(dialog).toContainText(images[0].caption)
    })
})
