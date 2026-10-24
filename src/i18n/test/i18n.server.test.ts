// @vitest-environment node
import { describe, expect, it, vi } from "vitest"

describe("i18n sem navegador", () => {
    it("importa sem window nem document e fica no fallback en", async () => {
        vi.resetModules()

        const { default: i18n } = await import("@/i18n/i18n")

        expect(typeof window).toBe("undefined")
        expect(typeof document).toBe("undefined")
        expect(i18n.resolvedLanguage).toBe("en")
    })
})
