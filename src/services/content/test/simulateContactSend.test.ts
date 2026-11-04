import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import simulateContactSend from "@/services/content/simulateContactSend"

describe("simulateContactSend", () => {
    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    it("só resolve depois de 1400 ms", async () => {
        const onResolve = vi.fn()
        simulateContactSend().then(onResolve)

        await vi.advanceTimersByTimeAsync(1399)
        expect(onResolve).not.toHaveBeenCalled()

        await vi.advanceTimersByTimeAsync(1)
        expect(onResolve).toHaveBeenCalledTimes(1)
    })
})
