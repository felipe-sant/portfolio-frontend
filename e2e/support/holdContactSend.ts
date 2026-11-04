import type { Page } from "@playwright/test"

const SIMULATED_DELAY_MS = 1400

async function holdContactSend(page: Page) {
    await page.addInitScript((delay) => {
        const nativeSetTimeout = window.setTimeout.bind(window)
        const held: Array<() => void> = []
        Reflect.set(window, "releaseContactSend", () => {
            held.splice(0).forEach((callback) => callback())
        })
        window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
            if (timeout === delay && typeof handler === "function") {
                held.push(() => handler(...args))
                return 0
            }
            return nativeSetTimeout(handler, timeout, ...args)
        }) as typeof window.setTimeout
    }, SIMULATED_DELAY_MS)

    return async function release() {
        await page.evaluate(() => Reflect.get(window, "releaseContactSend")())
    }
}

export default holdContactSend
