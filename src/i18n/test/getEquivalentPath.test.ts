import { describe, expect, it } from "vitest"
import getEquivalentPath from "@/i18n/getEquivalentPath"

describe("getEquivalentPath", () => {
    it("troca o prefixo mantendo o restante do caminho", () => {
        expect(getEquivalentPath("/en/projects", "es")).toBe("/es/projects")
    })

    it("preserva o id e o documento do projeto", () => {
        expect(getEquivalentPath("/es/projects/0190-abc/docs/architecture.md", "pt-BR")).toBe(
            "/pt-BR/projects/0190-abc/docs/architecture.md"
        )
    })

    it("devolve a Início do idioma para a Início", () => {
        expect(getEquivalentPath("/en", "es")).toBe("/es")
        expect(getEquivalentPath("/en/", "pt-BR")).toBe("/pt-BR")
    })

    it("devolve o mesmo caminho quando o idioma é o atual", () => {
        expect(getEquivalentPath("/en/projects", "en")).toBe("/en/projects")
    })

    it("volta ao caminho original na ida e volta en, es e pt-BR", () => {
        const toEs = getEquivalentPath("/en/projects/0190-abc", "es")
        const toPtBr = getEquivalentPath(toEs, "pt-BR")

        expect(getEquivalentPath(toPtBr, "en")).toBe("/en/projects/0190-abc")
    })

    it("acrescenta o prefixo a um caminho sem prefixo", () => {
        expect(getEquivalentPath("/projects", "en")).toBe("/en/projects")
    })
})
