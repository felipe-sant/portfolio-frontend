import { describe, expect, it } from "vitest"
import isUuidV7 from "@/utils/isUuidV7"

describe("isUuidV7", () => {
    it("aceita um UUID v7 canônico em minúsculas", () => {
        expect(isUuidV7("0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50")).toBe(true)
    })

    it("rejeita um UUID v4", () => {
        expect(isUuidV7("550e8400-e29b-41d4-a716-446655440000")).toBe(false)
    })

    it("rejeita maiúsculas", () => {
        expect(isUuidV7("0192F1A0-7C3E-7B21-8D4F-2A9E6C1B3F50")).toBe(false)
    })

    it("rejeita um UUID v7 real com uma letra maiúscula e valores que não são texto", () => {
        expect(isUuidV7("01a131df-93ee-72f3-8c7a-f67501e47A7a")).toBe(false)
        expect(isUuidV7(null)).toBe(false)
        expect(isUuidV7(42)).toBe(false)
    })

    it("aceita um UUID v7 dos conteúdos reais", () => {
        expect(isUuidV7("01a131df-93ee-72f3-8c7a-f67501e47a7a")).toBe(true)
    })

    it("rejeita variante inválida, texto vazio e valor que não é texto", () => {
        expect(isUuidV7("0192f1a0-7c3e-7b21-cd4f-2a9e6c1b3f50")).toBe(false)
        expect(isUuidV7("")).toBe(false)
        expect(isUuidV7(undefined)).toBe(false)
    })
})
