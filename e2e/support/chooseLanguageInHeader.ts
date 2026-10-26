import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"
import UI_TEXTS from "./uiTexts"

const DESKTOP_MIN_WIDTH = 640

const LANGUAGE_CONTROLS = {
    "pt-BR": { button: "Idioma: Português", option: "Português" },
    en: { button: "Language: English", option: "English" },
    es: { button: "Idioma: Español", option: "Español" }
} as const

type Language = keyof typeof LANGUAGE_CONTROLS

async function chooseLanguageInHeader(page: Page, from: Language, to: Language) {
    if ((page.viewportSize()?.width ?? 0) < DESKTOP_MIN_WIDTH) {
        const menu = page.getByRole("button", { name: UI_TEXTS[from].menu })
        if ((await menu.getAttribute("aria-expanded")) !== "true") {
            await menu.click()
        }
    }
    const button = page.getByRole("button", { name: LANGUAGE_CONTROLS[from].button })
    await button.click()
    await expect(button).toHaveAttribute("aria-expanded", "true")
    await page.getByRole("link", { name: LANGUAGE_CONTROLS[to].option, exact: true }).click()
}

export default chooseLanguageInHeader
