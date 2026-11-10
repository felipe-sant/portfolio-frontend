import { describe, expect, it } from "vitest"
import readWebpChunks from "@/services/content/readWebpChunks"
import buildWebpWithChunks from "@/testUtils/buildWebpWithChunks"

describe("readWebpChunks", () => {
    it("lista os blocos na ordem do arquivo", () => {
        const bytes = buildWebpWithChunks(["VP8X", "ICCP", "VP8 "])

        expect(readWebpChunks(bytes)).toEqual(["VP8X", "ICCP", "VP8 "])
    })

    it("lista o bloco EXIF e o bloco XMP", () => {
        const bytes = buildWebpWithChunks(["VP8X", "VP8 ", "EXIF", "XMP "])

        expect(readWebpChunks(bytes)).toEqual(["VP8X", "VP8 ", "EXIF", "XMP "])
    })

    it("considera o byte de preenchimento de blocos de tamanho ímpar", () => {
        const bytes = buildWebpWithChunks(["VP8 ", "EXIF"], 3)

        expect(readWebpChunks(bytes)).toEqual(["VP8 ", "EXIF"])
    })

    it("lança erro quando o arquivo termina no meio de um bloco", () => {
        const bytes = buildWebpWithChunks(["VP8 ", "EXIF"])

        expect(() => readWebpChunks(bytes.slice(0, bytes.length - 2))).toThrow(
            "Imagem WebP inválida"
        )
    })

    it("lança erro quando o contêiner não é RIFF WEBP", () => {
        expect(() => readWebpChunks(new Uint8Array(40))).toThrow("esperado WebP")
    })
})
