// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest"

async function loadConfig(ci: string | undefined) {
    vi.resetModules()
    if (ci === undefined) {
        vi.stubEnv("CI", "")
    } else {
        vi.stubEnv("CI", ci)
    }
    return (await import("@scripts/../playwright.config")).default
}

afterEach(() => {
    vi.unstubAllEnvs()
})

describe("playwright.config", () => {
    it("liga fullyParallel em qualquer ambiente", async () => {
        expect((await loadConfig("1")).fullyParallel).toBe(true)
        expect((await loadConfig(undefined)).fullyParallel).toBe(true)
    })

    it("define workers numérico no CI", async () => {
        const { workers } = await loadConfig("1")

        expect(typeof workers).toBe("number")
    })

    it("mantém o padrão do Playwright para workers fora do CI", async () => {
        expect((await loadConfig(undefined)).workers).toBeUndefined()
    })
})
