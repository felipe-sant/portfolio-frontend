import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"
import UI_TEXTS from "./uiTexts"

const DESKTOP_MIN_WIDTH = 640

type Language = keyof typeof UI_TEXTS

async function openProjectsFromHeader(page: Page, language: Language) {
    await page.goto(`${language}/rota-inexistente`)
    await page.getByRole("heading", { level: 1 }).waitFor()

    if ((page.viewportSize()?.width ?? 0) < DESKTOP_MIN_WIDTH) {
        await page.getByRole("button", { name: UI_TEXTS[language].menu }).click()
    }

    const navigation = page.getByRole("navigation", { name: UI_TEXTS[language].navigationLabel })
    await navigation
        .getByRole("link", { name: UI_TEXTS[language].navigation.projects, exact: true })
        .click()
    await expect(page).toHaveURL(new RegExp(`/${language}/projects$`))
}

export default openProjectsFromHeader
