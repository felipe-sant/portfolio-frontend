import { describe, expect, it } from "vitest"
import stripLanguagePrefix from "@/i18n/stripLanguagePrefix"

describe("stripLanguagePrefix", () => {
    it.each([
        ["/en/projects", "/projects"],
        [
            "/pt-BR/projects/0190-abc/docs/architecture.md",
            "/projects/0190-abc/docs/architecture.md"
        ],
        ["/es/about", "/about"],
        ["/en", "/"],
        ["/en/", "/"]
    ])("transforma %s em %s", (pathname, expected) => {
        expect(stripLanguagePrefix(pathname)).toBe(expected)
    })

    it.each([["/"], ["/entities"], ["/pt/projects"], ["/projects"], ["/fr"]])(
        "devolve %s como está",
        (pathname) => {
            expect(stripLanguagePrefix(pathname)).toBe(pathname)
        }
    )
})
