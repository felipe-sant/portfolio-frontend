import { AxeBuilder } from "@axe-core/playwright"
import type { Page } from "@playwright/test"
import waitForScrollRegionsFocusable from "./waitForScrollRegionsFocusable"

async function expectNoAxeViolations(page: Page) {
    await waitForScrollRegionsFocusable(page)
    const { violations } = await new AxeBuilder({ page }).analyze()

    if (violations.length > 0) {
        const report = violations
            .map(
                (violation) =>
                    `${violation.id}: ${violation.nodes.map((node) => node.target.join(" ")).join(" | ")}`
            )
            .join("\n")
        throw new Error(`Violações de acessibilidade:\n${report}`)
    }
}

export default expectNoAxeViolations
