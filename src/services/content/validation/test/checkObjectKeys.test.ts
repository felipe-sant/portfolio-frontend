import { describe, expect, it } from "vitest"
import checkObjectKeys from "@/services/content/validation/checkObjectKeys"
import type ContentIssue from "@/types/content/ContentIssue.types"

describe("checkObjectKeys", () => {
    it("aceita obrigatórios e opcionais conhecidos", () => {
        const issues: ContentIssue[] = []

        expect(checkObjectKeys({ a: 1, b: 2 }, "item", ["a"], ["b"], issues)).toBe(true)
        expect(issues).toEqual([])
    })

    it("reprova obrigatório ausente e campo desconhecido, com o caminho do campo", () => {
        const issues: ContentIssue[] = []

        checkObjectKeys({ c: 1 }, "arquivo.json#item", ["a"], [], issues)

        expect(issues).toEqual([
            { path: "arquivo.json#item.a", message: "Campo obrigatório ausente" },
            { path: "arquivo.json#item.c", message: "Campo desconhecido" }
        ])
    })

    it("junta direto quando o caminho termina em #", () => {
        const issues: ContentIssue[] = []

        checkObjectKeys({}, "arquivo.json#", ["a"], [], issues)

        expect(issues[0].path).toBe("arquivo.json#a")
    })

    it("reprova valor que não é objeto", () => {
        const issues: ContentIssue[] = []

        expect(checkObjectKeys([], "item", [], [], issues)).toBe(false)
        expect(checkObjectKeys(null, "item", [], [], issues)).toBe(false)
        expect(issues).toHaveLength(2)
    })
})
