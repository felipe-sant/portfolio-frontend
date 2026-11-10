import { describe, expect, it } from "vitest"
import decodeWebpDataUrl from "@scripts/decodeWebpDataUrl"

describe("decodeWebpDataUrl", () => {
    it("decodifica o base64 de um data URL image/webp", () => {
        const dataUrl = `data:image/webp;base64,${Buffer.from("RIFFxxxxWEBP").toString("base64")}`

        expect(decodeWebpDataUrl(dataUrl).toString()).toBe("RIFFxxxxWEBP")
    })

    it("lança erro quando o navegador devolve PNG por não suportar WebP", () => {
        const dataUrl = `data:image/png;base64,${Buffer.from("png").toString("base64")}`

        expect(() => decodeWebpDataUrl(dataUrl)).toThrow("data:image/webp")
    })

    it("lança erro quando o texto não é um data URL", () => {
        expect(() => decodeWebpDataUrl("")).toThrow("data:image/webp")
    })
})
