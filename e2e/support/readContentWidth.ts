import type { Page } from "@playwright/test"

async function readContentWidth(page: Page): Promise<number> {
    return page.evaluate(() => document.documentElement.getBoundingClientRect().width)
}

export default readContentWidth
