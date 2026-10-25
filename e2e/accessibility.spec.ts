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
