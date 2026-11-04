import type { Page } from "@playwright/test"
import FATEC_BASE_PATH from "@scripts/fatecBasePath"

async function navigateClientSide(page: Page, path: string) {
    await page.evaluate((target) => {
        window.history.pushState(null, "", target)
        window.dispatchEvent(new PopStateEvent("popstate"))
    }, `${FATEC_BASE_PATH}${path}`)
}

export default navigateClientSide
