import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import buildPromotionBody from "@scripts/buildPromotionBody"

function readHeadings(text: string): string[] {
    return text.split("\n").filter((line) => line.startsWith("## "))
}

const pulls = [
    { number: 30, title: "Feat um", issues: [12] },
    { number: 9, title: "Chore sem issue", issues: [] },
    { number: 31, title: "Fix dois", issues: [12, 5] }
]

describe("buildPromotionBody", () => {
    it("usa os mesmos títulos do template, na ordem", () => {
        const template = readFileSync(".github/PULL_REQUEST_TEMPLATE.md", "utf-8")

        expect(readHeadings(buildPromotionBody({ pulls }))).toEqual(readHeadings(template))
    })

    it("não contém Closes", () => {
        expect(buildPromotionBody({ pulls }).toLowerCase()).not.toContain("closes")
    })

    it("deixa os itens de revisão humana desmarcados", () => {
        const items = buildPromotionBody({ pulls })
            .split("\n")
            .filter((line) => /^- \[.\]/.test(line))

        expect(items.length).toBeGreaterThan(0)
        items.forEach((line) => {
            expect(line.startsWith("- [ ]")).toBe(true)
        })
    })

    it("lista a issue fechada por dois PRs uma vez, com os dois PRs", () => {
        const lines = buildPromotionBody({ pulls })
            .split("\n")
            .filter((line) => line.startsWith("- #12"))

        expect(lines).toEqual(["- #12 (PR #30, PR #31)"])
    })

    it("põe PR sem issue na lista própria", () => {
        const body = buildPromotionBody({ pulls })

        expect(body).toContain("- PR #9: Chore sem issue")
        expect(body).not.toContain("- #9")
    })

    it("ordena issues e PRs de forma crescente", () => {
        const body = buildPromotionBody({
            pulls: [
                { number: 8, title: "B", issues: [] },
                { number: 3, title: "A", issues: [] },
                { number: 20, title: "C", issues: [9, 2] }
            ]
        })

        expect(body.indexOf("- #2 ")).toBeLessThan(body.indexOf("- #9 "))
        expect(body.indexOf("- PR #3:")).toBeLessThan(body.indexOf("- PR #8:"))
    })

    it("traz Nenhum em impactos e pontos de atenção", () => {
        const body = buildPromotionBody({ pulls })

        expect(body.split("## Impactos e pontos de atenção")[1]?.trim()).toBe("Nenhum.")
    })

    it("mantém a estrutura com lista vazia de PRs", () => {
        const body = buildPromotionBody({ pulls: [] })

        expect(body).toContain("Nenhuma issue vinculada")
        expect(readHeadings(body)).toHaveLength(7)
    })
})
