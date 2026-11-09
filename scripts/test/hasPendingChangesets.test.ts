import { describe, expect, it } from "vitest"
import hasPendingChangesets from "@scripts/hasPendingChangesets"

describe("hasPendingChangesets", () => {
    it("devolve false para lista vazia", () => {
        expect(hasPendingChangesets([])).toBe(false)
    })

    it("devolve false com só README.md e config.json", () => {
        expect(hasPendingChangesets(["README.md", "config.json"])).toBe(false)
    })

    it("devolve true com um changeset junto do README.md", () => {
        expect(hasPendingChangesets(["README.md", "cool-cats-jump.md"])).toBe(true)
    })

    it("ignora arquivo que não é .md", () => {
        expect(hasPendingChangesets(["config.json", "notes.txt"])).toBe(false)
    })
})
