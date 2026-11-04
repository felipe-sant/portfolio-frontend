import type { Page } from "@playwright/test"

const SIMULATED_DELAY_MS = 1400

async function failContactSend(page: Page) {
    await page.addInitScript((delay) => {
        const nativeSetTimeout = window.setTimeout.bind(window)
        window.setTimeout = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
            if (timeout === delay && !Reflect.get(window, "contactSendRecovered")) {
                throw new Error("envio simulado falhou")
            }
            return nativeSetTimeout(handler, timeout, ...args)
        }) as typeof window.setTimeout
    }, SIMULATED_DELAY_MS)

    return async function recover() {
        await page.evaluate(() => Reflect.set(window, "contactSendRecovered", true))
    }
}

export default failContactSend
