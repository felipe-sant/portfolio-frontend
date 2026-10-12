import { describe, expect, it } from "vitest"
import validateReadmeSections from "@/services/content/validation/validateReadmeSections"

const required = ["Contexto", "Meu papel", "Solução", "Decisões técnicas", "Resultado"]

function readme(titles: string[]) {
    return titles.map((title) => `## ${title}\n\nTexto.\n`).join("\n")
}

describe("validateReadmeSections", () => {
    it("aceita as seções obrigatórias na ordem", () => {
        expect(validateReadmeSections("README.md", readme(required), "pt-BR")).toEqual([])
    })

    it("aceita a seção opcional Aprendizados no fim", () => {
        expect(
            validateReadmeSections("README.md", readme([...required, "Aprendizados"]), "pt-BR")
        ).toEqual([])
    })

    it("usa os títulos do idioma", () => {
        const english = ["Context", "My role", "Solution", "Technical decisions", "Outcome"]

        expect(validateReadmeSections("README.md", readme(english), "en")).toEqual([])
        expect(validateReadmeSections("README.md", readme(english), "pt-BR")).toHaveLength(1)
    })

    it("rejeita seção faltando, fora de ordem, extra ou com título errado", () => {
        expect(
            validateReadmeSections("README.md", readme(required.slice(1)), "pt-BR")
        ).toHaveLength(1)
        expect(
            validateReadmeSections(
                "README.md",
                readme([required[1], required[0], ...required.slice(2)]),
                "pt-BR"
            )
        ).toHaveLength(1)
        expect(
            validateReadmeSections(
                "README.md",
                readme([...required, "Aprendizados", "Extra"]),
                "pt-BR"
            )
        ).toHaveLength(1)
        expect(
            validateReadmeSections(
                "README.md",
                readme([...required.slice(0, 4), "Resultados"]),
                "pt-BR"
            )
        ).toHaveLength(1)
    })

    it("não conta título de outro nível", () => {
        const text = `${readme(required)}\n### Detalhe\n\nTexto.\n`

        expect(validateReadmeSections("README.md", text, "pt-BR")).toEqual([])
    })
})
