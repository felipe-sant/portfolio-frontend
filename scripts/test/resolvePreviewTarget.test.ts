import { describe, expect, it } from "vitest"
import resolvePreviewTarget from "@scripts/resolvePreviewTarget"

describe("resolvePreviewTarget", () => {
    it("sem variáveis serve dist na porta 4173", () => {
        expect(resolvePreviewTarget({})).toEqual({ directory: "dist", port: 4173 })
    })

    it("lê o diretório e a porta de PREVIEW_DIR e PREVIEW_PORT", () => {
        expect(resolvePreviewTarget({ PREVIEW_DIR: "dist-form", PREVIEW_PORT: "4174" })).toEqual({
            directory: "dist-form",
            port: 4174
        })
    })

    it("ignora variável vazia ou porta inválida", () => {
        expect(resolvePreviewTarget({ PREVIEW_DIR: "", PREVIEW_PORT: "abc" })).toEqual({
            directory: "dist",
            port: 4173
        })
    })

    it("trata a porta 0 como inválida e usa 4173", () => {
        expect(resolvePreviewTarget({ PREVIEW_PORT: "0" })).toEqual({
            directory: "dist",
            port: 4173
        })
    })
})
