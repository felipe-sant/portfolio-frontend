import type { Page } from "@playwright/test"

async function waitForHydration(page: Page) {
    await page.waitForFunction(() => {
        const isRoot = Object.keys(document.getElementById("root") ?? {}).some((key) =>
            key.startsWith("__reactContainer")
        )
        const controls = Array.from(
            document.querySelectorAll("main button, main input, main a[href]")
        )

        return (
            isRoot &&
            controls.every((element) =>
                Object.keys(element).some((key) => key.startsWith("__reactProps"))
            )
        )
    })
}

export default waitForHydration
