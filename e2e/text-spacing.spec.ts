import { expect, test } from "@playwright/test"
import type { Page } from "@playwright/test"
import applyTextSpacing from "./support/applyTextSpacing"
import expectNoAxeViolations from "./support/expectNoAxeViolations"
import waitForHydration from "./support/waitForHydration"

const LANGUAGES = ["pt-BR", "en", "es"] as const
const HEADER_WIDTH = 768
const TITLE_WIDTH = 360

async function openHome(page: Page, language: string, width: number) {
    await page.setViewportSize({ width, height: 900 })
    await page.goto(language)
    await page.getByRole("heading", { level: 1 }).waitFor()
    await waitForHydration(page)
    await applyTextSpacing(page)
}

async function readOverflow(page: Page) {
    return page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
}

test.describe("espaçamento de texto da WCAG 1.4.12", () => {
    for (const language of LANGUAGES) {
        test(`A11Y-1.4.12: o cabeçalho a ${HEADER_WIDTH}px não passa da largura da tela em ${language}`, async ({
            page
        }) => {
            await openHome(page, language, HEADER_WIDTH)

            await expect.poll(() => readOverflow(page)).toBeLessThanOrEqual(0)
            const links = page.getByRole("banner").getByRole("link")
            const count = await links.count()

            for (let index = 0; index < count; index += 1) {
                const box = await links.nth(index).boundingBox()

                if (box) {
                    expect(box.x).toBeGreaterThanOrEqual(0)
                    expect(box.x + box.width).toBeLessThanOrEqual(HEADER_WIDTH)
                }
            }

            await expectNoAxeViolations(page)
        })

        test(`A11Y-1.4.12: o título da Início cabe em ${TITLE_WIDTH}px em ${language}`, async ({
            page
        }) => {
            await openHome(page, language, TITLE_WIDTH)

            await expect.poll(() => readOverflow(page)).toBeLessThanOrEqual(0)
            const box = await page.getByRole("heading", { level: 1 }).boundingBox()
            expect(box?.x).toBeGreaterThanOrEqual(0)
            expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(TITLE_WIDTH)

            await expectNoAxeViolations(page)
        })
    }
})
