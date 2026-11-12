// @vitest-environment node
import { readdirSync, readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import buildDocumentDescription from "@/utils/buildDocumentDescription"

const MAX_LENGTH = 155

describe("buildDocumentDescription", () => {
    it.each([
        ["undefined", undefined],
        ["vazio", ""],
        ["só espaços", "   \n  \n"],
        ["só títulos", "# Título\n\n## Outro título\n"],
        ["só bloco de código", "```bash\nnpm install\n```\n"],
        ["só tabela", "| a | b |\n| - | - |\n| 1 | 2 |\n"],
        ["só HTML", '<p align="center">texto</p>\n'],
        [
            "só emblemas e imagens",
            "[![Build](https://x.dev/b.svg)](https://x.dev)\n\n![Tela](tela.png)\n"
        ]
    ])("devolve undefined para conteúdo %s", (_name, content) => {
        expect(buildDocumentDescription(content, "markdown")).toBeUndefined()
    })

    it("pula título, emblema, imagem e bloco de código até o primeiro parágrafo com texto", () => {
        const content = [
            "# Projeto",
            "",
            "[![Build](https://x.dev/b.svg)](https://x.dev)",
            "",
            "![Tela](tela.png)",
            "",
            "```bash",
            "npm install",
            "```",
            "",
            "Primeira linha do texto",
            "continua na segunda linha.",
            "",
            "Outro parágrafo."
        ].join("\n")

        expect(buildDocumentDescription(content, "markdown")).toBe(
            "Primeira linha do texto continua na segunda linha."
        )
    })

    it("remove a marcação de links, negrito, itálico e código", () => {
        const content = "Veja [o repositório](https://x.dev), **forte**, *leve* e `código`."

        expect(buildDocumentDescription(content, "markdown")).toBe(
            "Veja o repositório, forte, leve e código."
        )
    })

    it("corta no último espaço antes do limite e termina em reticências", () => {
        const content = Array.from({ length: 60 }, () => "palavra").join(" ")
        const description = buildDocumentDescription(content, "markdown")

        expect(description?.length).toBeLessThanOrEqual(MAX_LENGTH)
        expect(description?.endsWith("…")).toBe(true)
        expect(description).not.toMatch(/[\s,.;:]…$/)
        expect(
            description
                ?.slice(0, -1)
                .split(" ")
                .every((word) => word === "palavra")
        ).toBe(true)
    })

    it("não deixa pontuação solta antes das reticências", () => {
        const content = `${"a".repeat(140)}, ${"b".repeat(30)}`

        expect(buildDocumentDescription(content, "markdown")).toBe(`${"a".repeat(140)}…`)
    })

    it("mantém o texto inteiro quando cabe no limite", () => {
        const content = "x".repeat(MAX_LENGTH)

        expect(buildDocumentDescription(content, "markdown")).toBe(content)
    })

    it("usa o primeiro bloco de linhas não vazias no formato text", () => {
        const content = "# não é título\nsegunda linha\n\noutro bloco"

        expect(buildDocumentDescription(content, "text")).toBe("# não é título segunda linha")
    })

    it("gera descrições diferentes entre si e do resumo para os documentos reais", () => {
        const root = "public/content/pt-BR"
        const summaries = (
            JSON.parse(readFileSync(`${root}/projects.json`, "utf8")) as {
                items: { summary: string }[]
            }
        ).items.map((item) => item.summary)
        const descriptions = readdirSync(`${root}/projects`).flatMap((id) =>
            ["SETUP.md", "ARCHITECTURE.md"].flatMap((name) => {
                try {
                    return [
                        buildDocumentDescription(
                            readFileSync(`${root}/projects/${id}/docs/${name}`, "utf8"),
                            "markdown"
                        )
                    ]
                } catch {
                    return []
                }
            })
        )

        expect(descriptions).toHaveLength(6)
        expect(new Set(descriptions).size).toBe(6)
        descriptions.forEach((description) => {
            expect(description).toBeDefined()
            expect(summaries).not.toContain(description)
        })
    })
})
