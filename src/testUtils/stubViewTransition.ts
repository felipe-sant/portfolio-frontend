import { vi } from "vitest"

function stubViewTransition() {
    const startViewTransition = vi.fn((update?: () => void | Promise<void>) => {
        update?.()

        return {
            finished: Promise.resolve(),
            ready: Promise.resolve(),
            updateCallbackDone: Promise.resolve(),
            skipTransition: () => undefined
        }
    })

    Object.defineProperty(document, "startViewTransition", {
        value: startViewTransition,
        configurable: true,
        writable: true
    })

    return startViewTransition
}

export default stubViewTransition
