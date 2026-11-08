import { test } from "@playwright/test"
import expectNoAxeViolations from "./support/expectNoAxeViolations"
import ROUTES_UNDER_TEST from "./support/routesUnderTest"

for (const route of ROUTES_UNDER_TEST) {
    test(`/${route} não tem violações do axe`, async ({ page }) => {
        await page.goto(route)
        await page.getByRole("heading", { level: 1 }).waitFor()
        await expectNoAxeViolations(page)
    })
}

test("a faixa da stack rolável fica focável antes do axe, mesmo com a hidratação atrasada", async ({
    page
}) => {
    await page.route(/assets\/.*\.js$/, async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        await route.continue()
    })

    await page.goto("pt-BR")
    await page.getByRole("heading", { level: 1 }).waitFor()

    await expectNoAxeViolations(page)
})
