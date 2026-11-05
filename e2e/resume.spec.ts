import { expect, test } from "@playwright/test"
import type { Locator, Page } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"
import expectNoAxeViolations from "./support/expectNoAxeViolations"
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

        test(`${point.id}: sem visualizador de PDF o modal não tem iframe e mantém os dois links`, async ({
            page
        }) => {
            await forcePdfViewer(page, false)
            const texts = UI_TEXTS["pt-BR"]
            const link = await openPoint(page, point, "pt-BR")

            await link.click()

            const dialog = page.getByRole("dialog")
            await expect(dialog.locator("iframe")).toHaveCount(0)
            await expect(dialog.getByText(texts.resumeModal.noViewer)).toBeVisible()
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
            await expect(page.getByRole("dialog")).toBeVisible()

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
