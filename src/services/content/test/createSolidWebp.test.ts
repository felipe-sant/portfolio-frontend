import { describe, expect, it } from "vitest"
import createSolidWebp from "@/services/content/createSolidWebp"
import readImageSize from "@/services/content/readImageSize"

function ascii(bytes: Uint8Array, start: number, length: number) {
    return String.fromCharCode(...bytes.slice(start, start + length))
}

describe("createSolidWebp", () => {
    it("gera um contêiner WebP lossless pequeno", () => {
        const bytes = createSolidWebp(1600, 900, "#bdbdbd")

        expect(ascii(bytes, 0, 4)).toBe("RIFF")
        expect(ascii(bytes, 8, 4)).toBe("WEBP")
        expect(ascii(bytes, 12, 4)).toBe("VP8L")
        expect(bytes.length).toBeLessThan(64)
        const view = new DataView(bytes.buffer)
        expect(view.getUint32(4, true)).toBe(bytes.length - 8)
    })

    it.each([
        [1600, 900],
        [640, 360],
        [800, 800],
        [320, 320],
        [1, 1],
        [16384, 16384]
    ])("devolve %ix%i ao ler o que foi gerado", (width, height) => {
        expect(readImageSize(createSolidWebp(width, height, "#808080"))).toEqual({ width, height })
    })

    it("rejeita dimensões e cores inválidas", () => {
        expect(() => createSolidWebp(0, 10, "#808080")).toThrow("Dimensões inválidas")
        expect(() => createSolidWebp(10, 16385, "#808080")).toThrow("Dimensões inválidas")
        expect(() => createSolidWebp(10, 10, "cinza")).toThrow("Cor inválida")
    })
})
