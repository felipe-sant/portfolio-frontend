import { describe, expect, it } from "vitest"
import shouldHydrate from "@/utils/shouldHydrate"

describe("shouldHydrate", () => {
    it("hidrata quando o caminho é o pré-renderizado", () => {
        expect(shouldHydrate("/ra2581392423047/en", "/ra2581392423047/en")).toBe(true)
    })

    it("não hidrata quando o caminho é outro", () => {
        expect(shouldHydrate("/not-found", "/pt-BR/xyz")).toBe(false)
    })

    it("não hidrata sem caminho pré-renderizado", () => {
        expect(shouldHydrate(undefined, "/pt-BR")).toBe(false)
    })

    it("não hidrata a raiz quando não há caminho pré-renderizado", () => {
        expect(shouldHydrate(undefined, "/")).toBe(false)
    })
})
