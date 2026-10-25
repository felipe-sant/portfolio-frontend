import { afterEach, describe, expect, it, vi } from "vitest"
import getSiteUrl from "@/utils/getSiteUrl"

describe("getSiteUrl", () => {
    afterEach(() => {
        vi.unstubAllEnvs()
    })

    it("devolve localhost sem a variável fora de produção", () => {
        vi.stubEnv("VITE_SITE_URL", "")

        expect(getSiteUrl()).toBe("http://localhost:5173")
    })

    it("devolve o valor da variável", () => {
        vi.stubEnv("VITE_SITE_URL", "https://felipe-sant.vercel.app")

        expect(getSiteUrl()).toBe("https://felipe-sant.vercel.app")
    })

    it("remove a barra final", () => {
        vi.stubEnv("VITE_SITE_URL", "https://felipe-sant.vercel.app/")

        expect(getSiteUrl()).toBe("https://felipe-sant.vercel.app")
    })

    it("não cai em localhost em produção", () => {
        vi.stubEnv("MODE", "production")
        vi.stubEnv("VITE_SITE_URL", "")

        expect(getSiteUrl()).toBe("")
    })
})
