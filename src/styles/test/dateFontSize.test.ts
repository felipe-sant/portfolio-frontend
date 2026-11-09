import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

function readRule(file: string, selector: string): string {
    const css = readFileSync(file, "utf-8")
    const start = css.indexOf(`\n${selector} {`)
    if (start === -1) {
        return ""
    }
    return css.slice(start, css.indexOf("\n}", start))
}

describe("tamanho do texto de datas e cargos", () => {
    it.each([
        ["src/styles/components/trajectoryPeriod.module.css", ".period"],
        ["src/styles/components/projectCard.module.css", ".year"],
        ["src/styles/components/trajectoryItem.module.css", ".details"]
    ])("%s %s usa 14 px", (file, selector) => {
        expect(readRule(file, selector)).toContain("font-size: var(--text-body-sm)")
    })
})
