import { readFileSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import readColorTokens from "@scripts/readColorTokens"

const GLOBAL_CSS = readFileSync(join(process.cwd(), "src", "styles", "global.css"), "utf-8")

describe("readColorTokens", () => {
    it("lê as cores do tema claro do global.css", () => {
        expect(readColorTokens(GLOBAL_CSS)).toEqual({
            background: "#fbf9f5",
            body: "#7c7770",
            detail: "#202020",
            accent: "#ffcc00"
        })
    })

    it("lança erro com o nome do token que falta", () => {
        const css =
            ":root { --neutral-050: #fbf9f5; --neutral-500: #7c7770; --neutral-900: #202020; }"

        expect(() => readColorTokens(css)).toThrow("--brand-primary")
    })
})
