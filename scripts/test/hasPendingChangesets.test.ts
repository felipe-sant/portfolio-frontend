import { describe, expect, it } from "vitest"
import hasPendingChangesets from "@scripts/hasPendingChangesets"

const EMPTY = "---\n---\n"
const PATCH = '---\n"portfolio-frontend": patch\n---\n\nCorrige algo\n'

describe("hasPendingChangesets", () => {
    it("devolve false para lista vazia", () => {
        expect(hasPendingChangesets([])).toBe(false)
    })

    it("devolve false com só README.md e config.json", () => {
        expect(
            hasPendingChangesets([
                { name: "README.md", content: "# Changesets" },
                { name: "config.json", content: "{}" }
            ])
        ).toBe(false)
    })

    it("devolve true com um changeset que altera a versão", () => {
        expect(
            hasPendingChangesets([
                { name: "README.md", content: "" },
                { name: "cool-cats-jump.md", content: PATCH }
            ])
        ).toBe(true)
    })

    it("ignora arquivo que não é .md", () => {
        expect(hasPendingChangesets([{ name: "notes.txt", content: PATCH }])).toBe(false)
    })

    it("ignora changeset vazio", () => {
        expect(hasPendingChangesets([{ name: "slow-coats-turn.md", content: EMPTY }])).toBe(false)
    })

    it("ignora changeset vazio com linha em branco e fim de linha CRLF", () => {
        expect(
            hasPendingChangesets([{ name: "slow-coats-turn.md", content: "---\r\n\r\n---\r\n" }])
        ).toBe(false)
    })

    it("devolve true quando há um vazio e um que altera a versão", () => {
        expect(
            hasPendingChangesets([
                { name: "slow-coats-turn.md", content: EMPTY },
                { name: "cool-cats-jump.md", content: PATCH }
            ])
        ).toBe(true)
    })

    it("trata arquivo sem frontmatter como pendente", () => {
        expect(hasPendingChangesets([{ name: "odd.md", content: "" }])).toBe(true)
    })
})
