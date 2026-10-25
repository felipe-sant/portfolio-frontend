import type { Page } from "@playwright/test"

function readStackOffset(page: Page, heading: string) {
    return page
        .locator("section[aria-labelledby]", { has: page.getByRole("heading", { name: heading }) })
        .locator("div")
        .first()
        .evaluate((track) => new DOMMatrix(getComputedStyle(track).transform).m41)
}

export default readStackOffset
