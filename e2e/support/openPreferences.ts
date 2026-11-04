import type { Locator, Page } from "@playwright/test"

const DESKTOP_MIN_WIDTH = 640

async function openPreferences(page: Page): Promise<Locator> {
    const isDesktop = (page.viewportSize()?.width ?? 0) >= DESKTOP_MIN_WIDTH
    const trigger = page.getByRole("button", { name: isDesktop ? "Configurações" : "Menu" })

    if ((await trigger.getAttribute("aria-expanded")) !== "true") {
        await trigger.click()
    }

    const panelId = await trigger.getAttribute("aria-controls")

    if (!panelId) {
        throw new Error("o botão de preferências não aponta para um painel")
    }

    return page.locator(`[id="${panelId}"]`)
}

export default openPreferences
