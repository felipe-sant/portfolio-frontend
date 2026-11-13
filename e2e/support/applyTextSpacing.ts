import type { Page } from "@playwright/test"

const TEXT_SPACING_CSS = `
    * {
        line-height: 1.5 !important;
        letter-spacing: 0.12em !important;
        word-spacing: 0.16em !important;
    }
    p {
        margin-bottom: 2em !important;
    }
`

async function applyTextSpacing(page: Page) {
    await page.addStyleTag({ content: TEXT_SPACING_CSS })
}

export default applyTextSpacing
