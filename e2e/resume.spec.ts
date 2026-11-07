import { devices, expect, test } from "@playwright/test"
import type { Locator, Page, Route } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import expectNoAxeViolations from "./support/expectNoAxeViolations"
import collectConsoleProblems from "./support/collectConsoleProblems"
import navigateClientSide from "./support/navigateClientSide"
import readCanvasPixels from "./support/readCanvasPixels"
import UI_TEXTS from "./support/uiTexts"
import waitForHydration from "./support/waitForHydration"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const DESKTOP_MIN_WIDTH = 640

type Language = (typeof LANGUAGES)[number]

type Point = {
    id: string
    title: string
    path: string
    getLink: (page: Page, language: Language) => Locator
}

const POINTS: Point[] = [
    {
        id: "RF-HOME-07",
        title: "o Baixar CV do Início",
        path: "",
        getLink: (page, language) => page.getByRole("link", { name: UI_TEXTS[language].resumePdf })
    },
    {
        id: "RF-ABOUT-05",
        title: "o Baixar CV de Informações",
        path: "/about",
        getLink: (page, language) =>
            page.getByRole("main").getByRole("link", { name: UI_TEXTS[language].resumePdf })
    },
    {
        id: "RF-CONTACT-08",
        title: "o Baixar CV de Contato",
        path: "/contact",
        getLink: (page, language) =>
            page.getByRole("main").getByRole("link", { name: UI_TEXTS[language].resumePdf })
    },
    {
        id: "RF-LAY-27",
        title: "o Currículo em PDF do rodapé de Contato",
        path: "/contact",
        getLink: (page, language) =>
            page
                .getByRole("contentinfo")
                .getByRole("link", { name: UI_TEXTS[language].footerResumeName })
    }
]

function forcePdfViewer(page: Page, enabled: boolean) {
    return page.addInitScript((value) => {
        Object.defineProperty(Navigator.prototype, "pdfViewerEnabled", {
            get: () => value,
            configurable: true
        })
    }, enabled)
}

const TOUCH_VIEWPORT = { width: 390, height: 844 }
const WORKER_PATTERN = "**/assets/pdf.worker.min-*.mjs"

async function expectPaintedCanvas(dialog: Locator) {
    const canvas = dialog.locator("canvas").first()
    await expect(canvas).toBeVisible({ timeout: 15000 })
    await expect
        .poll(async () => (await readCanvasPixels(canvas)).inkPixels, { timeout: 15000 })
        .toBeGreaterThan(0)
}

async function openPoint(page: Page, point: Point, language: Language) {
    await page.goto(`${language}${point.path}`)
    await page.getByRole("heading", { level: 1 }).waitFor()
    await waitForHydration(page)
    const link = point.getLink(page, language)
    await expect(link).toBeVisible()
    return link
}

for (const point of POINTS) {
    test.describe(`${point.id}: ${point.title}`, () => {
        for (const language of LANGUAGES) {
            const texts = UI_TEXTS[language]
            const pdfPath = `${FATEC_BASE_PATH}cv/cv-${language}.pdf`

            test(`${point.id}: em ${language} é um link real para o PDF do idioma, sem download nem target`, async ({
                page
            }) => {
                const link = await openPoint(page, point, language)

                await expect(link).toHaveAttribute("href", pdfPath)
                await expect(link).not.toHaveAttribute("download", /.*/)
                await expect(link).not.toHaveAttribute("target", /.*/)
                const response = await page.request.get(pdfPath)
                expect(response.status()).toBe(200)
                expect(response.headers()["content-type"]).toBe("application/pdf")
            })

            test(`${point.id}: em ${language} o clique abre o modal com o PDF, sem mudar a URL, e o foco vai para o título`, async ({
                page
            }) => {
                await forcePdfViewer(page, true)
                const link = await openPoint(page, point, language)
                const url = page.url()

                await link.click()

                const dialog = page.getByRole("dialog", { name: texts.resumeModal.title })
                await expect(dialog).toBeVisible()
                await expect(dialog).toHaveAttribute("aria-modal", "true")
                await expect(
                    dialog.getByRole("heading", { level: 2, name: texts.resumeModal.title })
                ).toBeFocused()
                await expect(dialog.locator("iframe")).toHaveAttribute("src", pdfPath)
                await expect(dialog.locator("iframe")).toHaveAttribute(
                    "title",
                    texts.resumeModal.pdfTitle
                )
                expect(page.url()).toBe(url)
            })
        }

        test(`${point.id}: Esc fecha o modal e devolve o foco ao link de origem`, async ({
            page
        }) => {
            await forcePdfViewer(page, true)
            const link = await openPoint(page, point, "pt-BR")

            await link.click()
            await expect(page.getByRole("dialog")).toBeVisible()
            await page.keyboard.press("Escape")

            await expect(page.getByRole("dialog")).toHaveCount(0)
            await expect(link).toBeFocused()
            await expect(page.locator("#root")).not.toHaveAttribute("inert", /.*/)
        })

        test(`${point.id}: Fechar e o clique no fundo fecham o modal e devolvem o foco`, async ({
            page
        }) => {
            await forcePdfViewer(page, true)
            const texts = UI_TEXTS["pt-BR"]
            const link = await openPoint(page, point, "pt-BR")

            await link.click()
            await page
                .getByRole("dialog")
                .getByRole("button", { name: texts.resumeModal.close })
                .click()
            await expect(page.getByRole("dialog")).toHaveCount(0)
            await expect(link).toBeFocused()

            if ((page.viewportSize()?.width ?? 0) < DESKTOP_MIN_WIDTH) {
                return
            }

            await link.click()
            await expect(page.getByRole("dialog")).toBeVisible()
            await page.mouse.click(2, 2)
            await expect(page.getByRole("dialog")).toHaveCount(0)
            await expect(link).toBeFocused()
        })

        test(`${point.id}: Baixar PDF baixa o arquivo do idioma e a versão em texto abre o Markdown`, async ({
            page
        }) => {
            await forcePdfViewer(page, true)
            const link = await openPoint(page, point, "en")
            const texts = UI_TEXTS.en

            await link.click()
            const dialog = page.getByRole("dialog")
            const downloadLink = dialog.getByRole("link", { name: texts.resumeModal.download })
            const textLink = dialog.getByRole("link", { name: texts.resumeModal.viewText })
            await expect(textLink).toHaveAttribute("href", `${FATEC_BASE_PATH}cv/cv-en.md`)
            await expect(textLink).toHaveAttribute("target", "_blank")

            const downloading = page.waitForEvent("download")
            await downloadLink.click()
            const download = await downloading

            expect(download.suggestedFilename()).toBe("cv-en.pdf")
        })

        test(`${point.id}: sem visualizador de PDF o modal mostra o PDF em canvas, sem iframe, e mantém os dois links`, async ({
            page
        }) => {
            await forcePdfViewer(page, false)
            const texts = UI_TEXTS["pt-BR"]
            const link = await openPoint(page, point, "pt-BR")

            await link.click()

            const dialog = page.getByRole("dialog")
            await expect(dialog.locator("iframe")).toHaveCount(0)
            await expectPaintedCanvas(dialog)
            await expect(
                dialog.getByRole("link", { name: texts.resumeModal.download })
            ).toBeVisible()
            await expect(
                dialog.getByRole("link", { name: texts.resumeModal.viewText })
            ).toBeVisible()
        })

        test(`${point.id}: o modal aberto não tem violações do axe`, async ({ page }) => {
            await forcePdfViewer(page, false)
            const link = await openPoint(page, point, "pt-BR")

            await link.click()
            await expectPaintedCanvas(page.getByRole("dialog"))

            await expectNoAxeViolations(page)
        })

        test(`${point.id}: ao trocar de idioma o link aponta para o PDF do novo idioma`, async ({
            page
        }) => {
            for (const language of LANGUAGES) {
                const link = await openPoint(page, point, language)

                await expect(link).toHaveAttribute(
                    "href",
                    `${FATEC_BASE_PATH}cv/cv-${language}.pdf`
                )
            }
        })
    })
}

test.describe("RF-HOME-07, RF-ABOUT-05, RF-CONTACT-08, RF-LAY-27: sem JavaScript", () => {
    test.use({ javaScriptEnabled: false })

    for (const point of POINTS) {
        for (const language of LANGUAGES) {
            test(`${point.id}: em ${language} o link abre o PDF do idioma sem JavaScript`, async ({
                page
            }) => {
                await page.goto(`${language}${point.path}`)
                const link = point.getLink(page, language)
                await expect(link).toHaveAttribute(
                    "href",
                    `${FATEC_BASE_PATH}cv/cv-${language}.pdf`
                )

                const response = await page.request.get((await link.getAttribute("href")) ?? "")

                expect(response.status()).toBe(200)
                expect(response.headers()["content-type"]).toBe("application/pdf")
                expect(await page.getByRole("dialog").count()).toBe(0)
            })
        }
    }
})

test.describe("RF-LAY-27, NF-IA-20: versão em texto do currículo", () => {
    const EXPECTED_ACCENTS: Record<Language, string> = {
        "pt-BR": "São José dos Campos",
        en: "São José dos Campos",
        es: "São José dos Campos"
    }

    for (const language of LANGUAGES) {
        test(`o Markdown de ${language} é servido em UTF-8 e abre acentuado em nova aba`, async ({
            page
        }) => {
            await forcePdfViewer(page, true)
            const texts = UI_TEXTS[language]
            const markdownPath = `${FATEC_BASE_PATH}cv/cv-${language}.md`
            const response = await page.request.get(markdownPath)

            expect(response.status()).toBe(200)
            expect(response.headers()["content-type"]).toBe("text/markdown; charset=utf-8")

            const link = await openPoint(page, POINTS[0], language)
            await link.click()
            const popupOpening = page.waitForEvent("popup")
            await page
                .getByRole("dialog")
                .getByRole("link", { name: texts.resumeModal.viewText })
                .click()
            const popup = await popupOpening
            await popup.waitForLoadState()

            expect(popup.url()).toContain(markdownPath)
            const body = await popup.locator("body").innerText()
            expect(body).toContain(EXPECTED_ACCENTS[language])
            expect(body).not.toContain("�")
            expect(body).not.toContain("Ã")
        })
    }
})

test.describe("RF-HOME-07: PDF em canvas em celular", () => {
    test.use({ hasTouch: true, isMobile: true, viewport: TOUCH_VIEWPORT })

    for (const point of POINTS) {
        for (const language of LANGUAGES) {
            test(`${point.id}: em ${language} o celular sem visualizador mostra o PDF em canvas`, async ({
                page
            }) => {
                await forcePdfViewer(page, false)
                const texts = UI_TEXTS[language]
                const link = await openPoint(page, point, language)

                await link.click()

                const dialog = page.getByRole("dialog", { name: texts.resumeModal.title })
                await expect(dialog.locator("iframe")).toHaveCount(0)
                await expectPaintedCanvas(dialog)
                await expect(
                    dialog.getByRole("img", { name: texts.resumeModal.pageLabel(1, 2) })
                ).toBeVisible()
                await expect(
                    dialog.getByRole("link", { name: texts.resumeModal.download })
                ).toBeVisible()
                await expect(
                    dialog.getByRole("link", { name: texts.resumeModal.viewText })
                ).toBeVisible()
            })
        }
    }

    test("RF-HOME-07: com visualizador declarado mas ponteiro grosso (iOS) também usa canvas", async ({
        page
    }) => {
        await forcePdfViewer(page, true)
        const link = await openPoint(page, POINTS[0], "pt-BR")

        await link.click()

        const dialog = page.getByRole("dialog")
        await expect(dialog.locator("iframe")).toHaveCount(0)
        await expectPaintedCanvas(dialog)
    })

    test("RF-HOME-07: o worker vem da mesma origem, com MIME de JavaScript, sob o base do Pages", async ({
        page,
        baseURL
    }) => {
        await forcePdfViewer(page, false)
        const origin = new URL(baseURL ?? "").origin
        const foreign: string[] = []
        page.on("request", (request) => {
            if (new URL(request.url()).origin !== origin) {
                foreign.push(request.url())
            }
        })
        const workerResponse = page.waitForResponse((response) =>
            /\/assets\/pdf\.worker\.min-[\w-]+\.mjs$/.test(response.url())
        )
        const link = await openPoint(page, POINTS[0], "pt-BR")

        await link.click()
        const worker = await workerResponse

        expect(worker.status()).toBe(200)
        expect(worker.url().startsWith(`${origin}${FATEC_BASE_PATH}assets/`)).toBe(true)
        expect(worker.headers()["content-type"]).toMatch(/javascript/)
        await expectPaintedCanvas(page.getByRole("dialog"))
        expect(foreign).toEqual([])
    })

    test("RF-HOME-07: a região de páginas entra na ordem de foco e rola pelo teclado", async ({
        page
    }) => {
        await forcePdfViewer(page, false)
        const texts = UI_TEXTS["pt-BR"]
        const link = await openPoint(page, POINTS[0], "pt-BR")

        await link.click()
        const dialog = page.getByRole("dialog")
        await expectPaintedCanvas(dialog)
        const region = dialog.getByRole("region", { name: texts.resumeModal.pagesLabel })

        await page.keyboard.press("Tab")
        await expect(dialog.getByRole("button", { name: texts.resumeModal.close })).toBeFocused()
        await page.keyboard.press("Tab")
        await page.keyboard.press("Tab")
        await expect(region).toBeFocused()

        const before = await region.evaluate((element) => element.scrollTop)
        await page.keyboard.press("ArrowDown")
        await page.keyboard.press("PageDown")
        await expect
            .poll(() => region.evaluate((element) => element.scrollTop))
            .toBeGreaterThan(before)

        await page.keyboard.press("Tab")
        await expect(dialog.getByRole("link", { name: texts.resumeModal.download })).toBeFocused()
        await page.keyboard.press("Tab")
        await expect(dialog.getByRole("link", { name: texts.resumeModal.viewText })).toBeFocused()
    })

    test("RF-HOME-07: o worker bloqueado cai no texto de falha com os dois links, sem canvas", async ({
        page
    }) => {
        await forcePdfViewer(page, false)
        await page.route(WORKER_PATTERN, (route) => route.abort())
        const texts = UI_TEXTS["pt-BR"]
        const link = await openPoint(page, POINTS[0], "pt-BR")

        await link.click()

        const dialog = page.getByRole("dialog")
        await expect(dialog.getByText(texts.resumeModal.noViewer)).toBeVisible()
        await expect(dialog.locator("canvas")).toHaveCount(0)
        await expect(dialog.getByRole("link", { name: texts.resumeModal.download })).toBeVisible()
        await expect(dialog.getByRole("link", { name: texts.resumeModal.viewText })).toBeVisible()
        await expectNoAxeViolations(page)
    })

    test("RF-HOME-07: o PDF bloqueado cai no texto de falha com os dois links, sem canvas", async ({
        page
    }) => {
        await forcePdfViewer(page, false)
        await page.route("**/cv/cv-pt-BR.pdf", (route) => route.abort())
        const texts = UI_TEXTS["pt-BR"]
        const link = await openPoint(page, POINTS[0], "pt-BR")

        await link.click()

        const dialog = page.getByRole("dialog")
        await expect(dialog.getByText(texts.resumeModal.noViewer)).toBeVisible()
        await expect(dialog.locator("canvas")).toHaveCount(0)
        await expect(dialog.getByRole("link", { name: texts.resumeModal.download })).toBeVisible()
    })
})

for (const [name, device] of [
    ["Pixel 7", devices["Pixel 7"]],
    ["iPhone 14 Pro", devices["iPhone 14 Pro"]]
] as const) {
    test.describe(`RF-HOME-07: emulação de ${name} no Chromium`, () => {
        test.use({
            viewport: device.viewport,
            hasTouch: device.hasTouch,
            isMobile: device.isMobile,
            userAgent: device.userAgent
        })

        test(`RF-HOME-07: ${name} mostra o PDF em canvas e fecha devolvendo o foco`, async ({
            page
        }) => {
            const link = await openPoint(page, POINTS[0], "pt-BR")

            await link.click()

            const dialog = page.getByRole("dialog")
            await expect(dialog.locator("iframe")).toHaveCount(0)
            await expectPaintedCanvas(dialog)
            await page.keyboard.press("Escape")
            await expect(page.getByRole("dialog")).toHaveCount(0)
            await expect(link).toBeFocused()
        })
    })
}

test.describe("RF-HOME-07: desktop com visualizador de PDF", () => {
    test("RF-HOME-07: segue no iframe e não baixa o pdfjs nem o worker", async ({ page }) => {
        await forcePdfViewer(page, true)
        const requested: string[] = []
        page.on("request", (request) => requested.push(request.url()))
        const link = await openPoint(page, POINTS[0], "pt-BR")

        await link.click()

        const dialog = page.getByRole("dialog")
        await expect(dialog.locator("iframe")).toHaveCount(1)
        await expect(dialog.locator("canvas")).toHaveCount(0)
        expect(requested.filter((url) => /\/assets\/pdf[.-]/.test(url))).toEqual([])
    })
})

test.describe("RF-HOME-07, CA13, CA16: estados e layout do modal em canvas", () => {
    test.use({ hasTouch: true, isMobile: true, viewport: TOUCH_VIEWPORT })

    test("RF-HOME-07: enquanto o PDF carrega o modal mostra o estado de carregamento e os dois links", async ({
        page
    }) => {
        await forcePdfViewer(page, false)
        const texts = UI_TEXTS["pt-BR"]
        const held: Route[] = []
        await page.route("**/cv/cv-pt-BR.pdf", (route) => {
            held.push(route)
        })
        const link = await openPoint(page, POINTS[0], "pt-BR")

        await link.click()

        const dialog = page.getByRole("dialog")
        await expect(dialog.getByRole("status")).toContainText(texts.resumeModal.loading)
        await expect(dialog.locator("canvas")).toHaveCount(0)
        await expect(dialog.getByRole("link", { name: texts.resumeModal.download })).toBeVisible()
        await expect(dialog.getByRole("link", { name: texts.resumeModal.viewText })).toBeVisible()
        await expectNoAxeViolations(page)
        await expect.poll(() => held.length).toBeGreaterThan(0)
        await held[0].continue()
        await expectPaintedCanvas(dialog)
    })

    test("CA16: em 390px os dois links do rodapé ficam dentro do modal, sem rolagem horizontal", async ({
        page
    }) => {
        await forcePdfViewer(page, false)
        const texts = UI_TEXTS["pt-BR"]
        const link = await openPoint(page, POINTS[0], "pt-BR")

        await link.click()
        const dialog = page.getByRole("dialog")
        await expectPaintedCanvas(dialog)

        const dialogBox = await dialog.boundingBox()
        const downloadBox = await dialog
            .getByRole("link", { name: texts.resumeModal.download })
            .boundingBox()
        const textBox = await dialog
            .getByRole("link", { name: texts.resumeModal.viewText })
            .boundingBox()
        expect(dialogBox).not.toBeNull()
        expect(downloadBox).not.toBeNull()
        expect(textBox).not.toBeNull()
        if (!dialogBox || !downloadBox || !textBox) {
            return
        }
        for (const box of [downloadBox, textBox]) {
            expect(box.x).toBeGreaterThanOrEqual(dialogBox.x)
            expect(box.x + box.width).toBeLessThanOrEqual(dialogBox.x + dialogBox.width + 1)
        }
        const sameRow = Math.abs(downloadBox.y - textBox.y) < 4
        if (sameRow) {
            expect(downloadBox.x + downloadBox.width).toBeLessThanOrEqual(textBox.x)
        } else {
            expect(Math.abs(downloadBox.y - textBox.y)).toBeGreaterThanOrEqual(
                Math.min(downloadBox.height, textBox.height)
            )
        }
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        )
        expect(overflow).toBeLessThanOrEqual(0)
    })

    test("RF-HOME-07: a região rola até a última página, que também é desenhada", async ({
        page
    }) => {
        await forcePdfViewer(page, false)
        const texts = UI_TEXTS["pt-BR"]
        const link = await openPoint(page, POINTS[0], "pt-BR")

        await link.click()
        const dialog = page.getByRole("dialog")
        await expectPaintedCanvas(dialog)
        const region = dialog.getByRole("region", { name: texts.resumeModal.pagesLabel })

        await region.evaluate((element) => element.scrollTo(0, element.scrollHeight))
        const last = dialog.getByRole("img", { name: texts.resumeModal.pageLabel(2, 2) })
        await expect(last).toBeInViewport()
        await expect
            .poll(async () => (await readCanvasPixels(last)).inkPixels, { timeout: 15000 })
            .toBeGreaterThan(0)
    })

    test("RF-HOME-07: abrir e fechar em seguida nos três idiomas não gera erro no console", async ({
        page
    }) => {
        await forcePdfViewer(page, false)
        const problems = collectConsoleProblems(page)
        const texts = UI_TEXTS["pt-BR"]

        for (let round = 0; round < 3; round += 1) {
            const link = await openPoint(page, POINTS[0], LANGUAGES[round])
            await link.click()
            await expect(page.getByRole("dialog")).toBeVisible()
            await page.keyboard.press("Escape")
            await expect(page.getByRole("dialog")).toHaveCount(0)
        }

        const link = await openPoint(page, POINTS[0], "pt-BR")
        await link.click()
        await expectPaintedCanvas(page.getByRole("dialog"))
        await page
            .getByRole("dialog")
            .getByRole("button", { name: texts.resumeModal.close })
            .click()
        await expect(page.getByRole("dialog")).toHaveCount(0)

        expect(problems).toEqual([])
    })

    test("RF-LAY-27: o modal aberto pelo rodapé de Contato fecha ao trocar de rota", async ({
        page
    }) => {
        await forcePdfViewer(page, false)
        const link = await openPoint(page, POINTS[3], "pt-BR")

        await link.click()
        await expect(page.getByRole("dialog")).toHaveCount(1)
        await navigateClientSide(page, "en/contact")

        await expect(page).toHaveURL(/\/en\/contact$/)
        await expect(page.getByRole("dialog")).toHaveCount(0)
    })

    test("RF-HOME-07: voltar e avançar no histórico depois de abrir o modal em Informações deixa o modal fechado e sem erro no console", async ({
        page
    }) => {
        await forcePdfViewer(page, false)
        const problems = collectConsoleProblems(page)
        await openPoint(page, POINTS[0], "pt-BR")
        const homeUrl = page.url()
        await navigateClientSide(page, "pt-BR/about")
        await expect(page).toHaveURL(/\/pt-BR\/about$/)
        const aboutUrl = page.url()
        await expect(page).toHaveTitle(UI_TEXTS["pt-BR"].aboutPage.title)
        const link = POINTS[1].getLink(page, "pt-BR")
        await expect(link).toBeVisible()

        await link.click()
        await expectPaintedCanvas(page.getByRole("dialog"))
        await page.goBack()

        await expect(page).toHaveURL(homeUrl)
        await expect(page.getByRole("dialog")).toHaveCount(0)
        await page.goForward()
        await expect(page).toHaveURL(aboutUrl)
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
        await expect(page.getByRole("dialog")).toHaveCount(0)
        expect(problems).toEqual([])
    })

    test("RF-HOME-07: em 320px de largura (zoom equivalente) o modal não gera rolagem horizontal", async ({
        page
    }) => {
        await page.setViewportSize({ width: 320, height: 568 })
        await forcePdfViewer(page, false)
        const link = await openPoint(page, POINTS[0], "pt-BR")

        await link.click()
        const dialog = page.getByRole("dialog")
        await expectPaintedCanvas(dialog)

        const pageOverflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        )
        const dialogWidth = await dialog.evaluate((element) => element.scrollWidth)
        expect(pageOverflow).toBeLessThanOrEqual(0)
        expect(dialogWidth).toBeLessThanOrEqual(320)
    })
})
