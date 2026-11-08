import { expect } from "@playwright/test"
import type { Page } from "@playwright/test"

const HYDRATION_TIMEOUT = 15000
const FOCUSABLE = "a[href], button, input, select, textarea, [tabindex]"

async function hasUnfocusableScrollRegion(page: Page) {
    return page.evaluate((focusable) => {
        return Array.from(document.body.querySelectorAll<HTMLElement>("*")).some((element) => {
            const { overflowX, overflowY } = getComputedStyle(element)
            const scrolls =
                (/auto|scroll/.test(overflowX) && element.scrollWidth > element.clientWidth) ||
                (/auto|scroll/.test(overflowY) && element.scrollHeight > element.clientHeight)

            return (
                scrolls && !element.matches(focusable) && element.querySelector(focusable) === null
            )
        })
    }, FOCUSABLE)
}

async function waitForScrollRegionsFocusable(page: Page) {
    await expect
        .poll(() => hasUnfocusableScrollRegion(page), { timeout: HYDRATION_TIMEOUT })
        .toBe(false)
}

export default waitForScrollRegionsFocusable
