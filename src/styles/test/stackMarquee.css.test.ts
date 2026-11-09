import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const css = readFileSync("src/styles/components/stackMarquee.module.css", "utf-8")

function readBlock(opening: string): string {
    const start = css.indexOf(opening)
    if (start === -1) {
        return ""
    }
    return css.slice(start, css.indexOf("\n}", start))
}

describe("stackMarquee.module.css", () => {
    it("não depende do tipo de ponteiro", () => {
        expect(css).not.toContain("pointer: coarse")
    })

    it("esconde a cópia do laço com movimento reduzido do sistema", () => {
        const block = readBlock("@media (prefers-reduced-motion: reduce)")

        expect(block).toContain(':root:not([data-motion]) .list[aria-hidden="true"]')
        expect(block).toContain("display: none")
    })

    it("esconde a cópia do laço com movimento reduzido escolhido", () => {
        expect(css).toMatch(
            /:root\[data-motion="reduced"\] \.list\[aria-hidden="true"\] \{\s*display: none;/
        )
    })
})
