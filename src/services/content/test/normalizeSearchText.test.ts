import { describe, expect, it } from "vitest"
import normalizeSearchText from "@/services/content/normalizeSearchText"

describe("normalizeSearchText", () => {
    it("remove acentos e usa minúsculas", () => {
        expect(normalizeSearchText("Catálogo de Componentes", "pt-BR")).toBe(
            "catalogo de componentes"
        )
    })

    it("mantém pontuação como texto literal", () => {
        expect(normalizeSearchText("C# e Node.js", "en")).toBe("c# e node.js")
    })

    it("remove acentos também em espanhol", () => {
        expect(normalizeSearchText("ÁRBOL", "es")).toBe("arbol")
    })
})
