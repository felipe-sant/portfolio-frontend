import type { Page } from "@playwright/test"

async function holdContent(page: Page, language: string, file: string) {
    const gate = Promise.withResolvers<void>()
    await page.route(`**/content/${language}/${file}.json`, async (route) => {
        await gate.promise
        await route.continue()
    })
    return gate.resolve
}

export default holdContent
