import { describe, expect, it } from "vitest"
import readImageSize from "@/services/content/readImageSize"

function container(fourcc: string, payload: number[]) {
    const bytes = [..."RIFF"].map((c) => c.charCodeAt(0))
    const size = 4 + 8 + payload.length
    bytes.push(size & 0xff, (size >> 8) & 0xff, 0, 0)
    bytes.push(...[..."WEBP", ...fourcc].map((c) => c.charCodeAt(0)))
    bytes.push(payload.length & 0xff, (payload.length >> 8) & 0xff, 0, 0)
    bytes.push(...payload)

    return Uint8Array.from(bytes)
}

describe("readImageSize", () => {
    it("lê o tamanho de um WebP lossy (VP8)", () => {
        const payload = [0, 0, 0, 0x9d, 0x01, 0x2a, 0x40, 0x06, 0x84, 0x03, 0, 0]

        expect(readImageSize(container("VP8 ", payload))).toEqual({ width: 1600, height: 900 })
    })

    it("lê o tamanho de um WebP estendido (VP8X)", () => {
        const payload = [0, 0, 0, 0, 0x3f, 0x06, 0, 0x83, 0x03, 0]

        expect(readImageSize(container("VP8X", payload))).toEqual({ width: 1600, height: 900 })
    })

    it("falha para formato desconhecido", () => {
        expect(() =>
            readImageSize(
                Uint8Array.from([137, 80, 78, 71, ...Array.from({ length: 40 }, () => 0)])
            )
        ).toThrow("esperado WebP")
        expect(() => readImageSize(new Uint8Array())).toThrow("esperado WebP")
    })

    it("falha para quadro VP8 sem código de início e VP8L sem assinatura", () => {
        expect(() =>
            readImageSize(
                container(
                    "VP8 ",
                    Array.from({ length: 12 }, () => 0)
                )
            )
        ).toThrow("código de início")
        expect(() =>
            readImageSize(
                container(
                    "VP8L",
                    Array.from({ length: 12 }, () => 0)
                )
            )
        ).toThrow("assinatura")
    })

    it("falha para chunk WebP não suportado", () => {
        expect(() =>
            readImageSize(
                container(
                    "ABCD",
                    Array.from({ length: 12 }, () => 0)
                )
            )
        ).toThrow("não suportado")
    })
})
