import { describe, expect, it } from "vitest"
import validateMarkdownDocument from "@/services/content/validation/validateMarkdownDocument"

const PROJECT_ID = "0192f1a0-7c3e-7b21-8d4f-2a9e6c1b3f50"
const projectDocuments = { [PROJECT_ID]: ["README.md", "SETUP.md"] }

function messagesOf(text: string) {
    return validateMarkdownDocument("doc.md", text, projectDocuments).map((issue) => issue.message)
}

const valid = `## Contexto

Texto com **ênfase**, ~~tachado~~ e [site](https://example.com), [e-mail](mailto:a@example.com),
[projeto](project:${PROJECT_ID}), [setup](project:${PROJECT_ID}/docs/SETUP.md#passos) e [topo](#contexto).

- [x] feito
- [ ] a fazer

| Decisão | Motivo |
| ------- | ------ |
| Vite    | Rápido |

\`\`\`ts title="src/a.ts"
const a = 1
\`\`\`
`

describe("validateMarkdownDocument", () => {
    it("aceita um documento válido", () => {
        expect(messagesOf(valid)).toEqual([])
    })

    it("rejeita HTML em bloco e em linha", () => {
        expect(messagesOf("## A\n\n<div>oi</div>\n")).toContain("HTML não é permitido")
        expect(messagesOf("## A\n\ntexto <br> texto\n")).toContain("HTML não é permitido")
    })

    it("rejeita imagem", () => {
        expect(messagesOf("## A\n\n![alt](a.png)\n")).toContain("Imagem não é permitida")
    })

    it("rejeita nota de rodapé", () => {
        expect(messagesOf("## A\n\ntexto[^1]\n\n[^1]: nota\n")).toContain(
            "Nota de rodapé não é permitida"
        )
    })

    it("rejeita título de nível 1", () => {
        expect(messagesOf("# A\n")).toEqual(["Título # não é permitido; comece em ##"])
        expect(messagesOf("A\n===\n")).toEqual(["Título # não é permitido; comece em ##"])
    })

    it("rejeita bloco de código sem linguagem", () => {
        expect(messagesOf("## A\n\n```\ncodigo\n```\n")).toEqual(["Bloco de código sem linguagem"])
    })

    it("rejeita tabela sem linha de cabeçalho", () => {
        expect(messagesOf("## A\n\n| a | b |\n| c | d |\n")).toContain(
            "Tabela sem linha de cabeçalho"
        )
        expect(messagesOf("## A\n\n|   |   |\n| - | - |\n| c | d |\n")).toContain(
            "Tabela sem linha de cabeçalho preenchida"
        )
    })

    it.each([
        ["[x](ftp://example.com)", "URL não permitida: ftp://example.com"],
        ["[x](javascript:alert(1))", "URL não permitida: javascript:alert(1)"],
        ["[x](pagina.html)", "URL não permitida: pagina.html"],
        [
            "[x](project:0192f1a0-0000-7000-8000-000000000001)",
            "Link para projeto inexistente: 0192f1a0-0000-7000-8000-000000000001"
        ],
        [
            `[x](project:${PROJECT_ID}/docs/MISSING.md)`,
            `Link para documento inexistente: ${PROJECT_ID}/docs/MISSING.md`
        ]
    ])("rejeita o link %s", (link, message) => {
        expect(messagesOf(`## A\n\n${link}\n`)).toEqual([message])
    })

    it("indica a linha do problema", () => {
        const [issue] = validateMarkdownDocument("doc.md", "## A\n\n<div>oi</div>\n", {})

        expect(issue.path).toBe("doc.md#linha 3")
    })

    it("valida a URL de definição de link", () => {
        expect(messagesOf("## A\n\n[x][ref]\n\n[ref]: ftp://example.com\n")).toEqual([
            "URL não permitida: ftp://example.com"
        ])
    })
})
