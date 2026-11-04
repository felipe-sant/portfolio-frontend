import type { Page } from "@playwright/test"

async function waitForHydration(page: Page) {
    await page.waitForFunction(() =>
        Object.keys(document.getElementById("root") ?? {}).some((key) =>
            key.startsWith("__reactContainer")
        )
    )
}

export default waitForHydration
