import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const css = `\n${readFileSync("src/styles/components/chip.module.css", "utf-8")}`

function readRule(selector: string): string {
    const start = css.indexOf(`\n${selector} {`)
    if (start === -1) {
        return ""
    }
    return css.slice(start, css.indexOf("\n}", start))
}

describe("chip.module.css", () => {
    it("usa a fonte mono por padrão e a do corpo na variante body", () => {
        expect(readRule(".chip")).toContain("font-family: var(--font-mono)")
        expect(readRule(".body")).toContain("font-family: var(--font-body)")
    })
})
