import { describe, expect, it } from "vitest"
import resolveSiteUrl from "@scripts/resolveSiteUrl"

describe("resolveSiteUrl", () => {
    it.each([[undefined], [""], ["   "]])("rejeita %j como ausente", (value) => {
        expect(() => resolveSiteUrl(value)).toThrow(/VITE_SITE_URL ausente ou vazia/)
    })

    it.each([["felipe-sant.vercel.app"], ["ftp://felipe-sant.vercel.app"], ["not a url"]])(
        "rejeita %j sem http ou https",
        (value) => {
            expect(() => resolveSiteUrl(value)).toThrow(/VITE_SITE_URL inválida/)
        }
    )

    it.each([
        ["https://felipe-sant.vercel.app/ra2581392423047"],
        ["https://felipe-sant.vercel.app/?a=1"],
        ["https://felipe-sant.vercel.app?a=1"],
        ["https://felipe-sant.vercel.app/#a"],
        ["https://felipe-sant.vercel.app#a"]
    ])("rejeita %j com caminho, query ou hash", (value) => {
        expect(() => resolveSiteUrl(value)).toThrow(/BASE_PATH/)
    })

    it.each([
        ["https://felipe-sant.vercel.app"],
        ["https://felipe-sant.vercel.app/"],
        [" https://felipe-sant.vercel.app/ "]
    ])("normaliza %j sem barra final", (value) => {
        expect(resolveSiteUrl(value)).toBe("https://felipe-sant.vercel.app")
    })

    it("aceita http com porta", () => {
        expect(resolveSiteUrl("http://localhost:5173")).toBe("http://localhost:5173")
    })
})
