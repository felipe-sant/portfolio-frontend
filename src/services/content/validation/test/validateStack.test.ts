import { describe, expect, it } from "vitest"
import validateStack from "@/services/content/validation/validateStack"
import type ContentIssue from "@/types/content/ContentIssue.types"

function messagesOf(stack: unknown, minGroups = 1) {
    const issues: ContentIssue[] = []
    validateStack(stack, "stack", minGroups, issues)
    return issues.map((issue) => `${issue.path} ${issue.message}`)
}

describe("validateStack", () => {
    it("aceita grupos na ordem do enum", () => {
        expect(
            messagesOf([
                { category: "frontend", items: [{ name: "React", isPrimary: true }] },
                { category: "tooling", items: [{ name: "Docker", isProgrammingLanguage: false }] }
            ])
        ).toEqual([])
    })

    it("aceita lista vazia quando o mínimo é zero e reprova quando é um", () => {
        expect(messagesOf([], 0)).toEqual([])
        expect(messagesOf([], 1)).toEqual(["stack A stack precisa de pelo menos 1 grupo"])
    })

    it("reprova stack que não é lista", () => {
        expect(messagesOf("React", 0)).toEqual(["stack Deve ser uma lista"])
    })

    it("reprova categoria repetida e fora de ordem", () => {
        const messages = messagesOf([
            { category: "backend", items: [{ name: "Node.js" }] },
            { category: "frontend", items: [{ name: "React" }] },
            { category: "frontend", items: [{ name: "Vue" }] }
        ])

        expect(messages).toEqual([
            "stack[1].category Grupos fora da ordem do enum (frontend, backend, tooling)",
            "stack[2].category Categoria repetida: frontend",
            "stack[2].category Grupos fora da ordem do enum (frontend, backend, tooling)"
        ])
    })

    it("reprova grupo sem item, nome vazio, nome repetido e marcação que não é booleana", () => {
        const messages = messagesOf([
            { category: "frontend", items: [] },
            {
                category: "backend",
                items: [
                    { name: "Node.js" },
                    { name: "Node.js" },
                    { name: "" },
                    { name: "Go", isPrimary: "sim" }
                ]
            }
        ])

        expect(messages).toEqual([
            "stack[0].items O grupo precisa de pelo menos um item",
            "stack[1].items[1].name Tecnologia repetida no grupo: Node.js",
            "stack[1].items[2].name Deve ser um texto não vazio",
            "stack[1].items[3].isPrimary Deve ser verdadeiro ou falso"
        ])
    })

    it("reprova campo desconhecido no item e grupo que não é objeto", () => {
        const messages = messagesOf([
            { category: "frontend", items: [{ name: "React", version: "19" }] },
            "backend"
        ])

        expect(messages).toEqual([
            "stack[0].items[0].version Campo desconhecido",
            "stack[1] Deve ser um objeto"
        ])
    })
})
