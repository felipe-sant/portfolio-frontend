import { describe, expect, it } from "vitest"
import resolveRelease from "@scripts/resolveRelease"

describe("resolveRelease", () => {
    it.each([["0.9.9"], ["0.1.0"]])("não faz release da versão %s", (version) => {
        expect(resolveRelease(version, []).release).toBe(false)
    })

    it("faz release de 1.0.0 com a tag v1.0.0", () => {
        const result = resolveRelease("1.0.0", [])
        expect(result.release).toBe(true)
        expect(result.tag).toBe("v1.0.0")
    })

    it("não faz release quando a tag já existe", () => {
        expect(resolveRelease("1.0.0", ["v1.0.0"]).release).toBe(false)
    })

    it.each([
        ["1.0.0", true],
        ["1.4.2", true],
        ["2.0.0", false]
    ])("publica na Fatec a versão %s: %s", (version, expected) => {
        expect(resolveRelease(version, []).publishFatec).toBe(expected)
    })

    it.each([["1.0"], [""], ["1.0.0-beta.1"]])("rejeita a versão inválida %j", (version) => {
        expect(() => resolveRelease(version, [])).toThrow(/Versão inválida/)
    })
})
