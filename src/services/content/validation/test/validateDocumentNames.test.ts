import { describe, expect, it } from "vitest"
import validateDocumentNames from "@/services/content/validation/validateDocumentNames"

describe("validateDocumentNames", () => {
    it("aceita nomes válidos e distintos", () => {
        expect(
            validateDocumentNames("projects.json", [
                "README.md",
                "SETUP.md",
                "LICENSE",
                "a_b-c.json"
            ])
        ).toEqual([])
    })

    it.each([
        "",
        "com espaço.md",
        "acentuação.md",
        "dir/arquivo.md",
        ".env",
        "-a.md",
        `${"a".repeat(65)}`
    ])("rejeita o nome %j", (name) => {
        expect(validateDocumentNames("projects.json", [name])).toHaveLength(1)
    })

    it("aceita 64 caracteres", () => {
        expect(validateDocumentNames("projects.json", ["a".repeat(64)])).toEqual([])
    })

    it("rejeita nomes repetidos sem diferenciar caixa", () => {
        expect(validateDocumentNames("projects.json", ["README.md", "readme.md"])).toHaveLength(1)
    })
})
