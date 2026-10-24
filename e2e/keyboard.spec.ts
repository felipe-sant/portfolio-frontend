import { expect, test } from "@playwright/test"

const MOBILE_MAX_WIDTH = 480
const MAX_TAB_STOPS = 60

test.beforeEach(async ({ page }) => {
    await page.goto("pt-BR")
    await page.getByRole("heading", { level: 1 }).waitFor()
})

test("pular para o conteúdo leva o foco ao main", async ({ page }) => {
    await page.keyboard.press("Tab")
    const skipLink = page.getByRole("link", { name: "Pular para o conteúdo" })
    await expect(skipLink).toBeFocused()

    await page.keyboard.press("Enter")
    await expect(page.getByRole("main")).toBeFocused()
})

test("menu mobile abre, prende o foco, fecha com Esc e devolve o foco ao botão", async ({
    page
}) => {
    test.skip((page.viewportSize()?.width ?? 0) > MOBILE_MAX_WIDTH, "menu existe só no mobile")

    const button = page.getByRole("button", { name: "Menu" })
    const panel = page.locator("header [id]").filter({ has: page.getByRole("navigation") })

    await button.click()
    await expect(button).toHaveAttribute("aria-expanded", "true")
    await expect(panel.getByRole("link").first()).toBeFocused()

    const panelFocusable = panel.locator("a, button")
    const insideCount = await panelFocusable.count()
    for (let step = 0; step < insideCount + 3; step++) {
        await page.keyboard.press("Tab")
        const isInside = await page.evaluate(() => {
            const active = document.activeElement
            const header = document.querySelector("header")
            return Boolean(active && header && header.contains(active))
        })
        expect(isInside).toBe(true)
    }

    await page.keyboard.press("Escape")
    await expect(button).toHaveAttribute("aria-expanded", "false")
    await expect(button).toBeFocused()
})

test("o foco nunca fica sob o cabeçalho", async ({ page }) => {
    const headerBottom = async () =>
        page.locator("header").evaluate((element) => element.getBoundingClientRect().bottom)

    for (let step = 0; step < MAX_TAB_STOPS; step++) {
        await page.keyboard.press("Tab")
        const focusedTop = await page.evaluate(() => {
            const active = document.activeElement
            const header = document.querySelector("header")
            const isSkipLink = active?.getAttribute("href") === "#main-content"
            if (!active || active === document.body || isSkipLink || header?.contains(active)) {
                return null
            }
            return active.getBoundingClientRect().top
        })
        if (focusedTop !== null) {
            expect(focusedTop).toBeGreaterThanOrEqual(await headerBottom())
        }
    }
})
