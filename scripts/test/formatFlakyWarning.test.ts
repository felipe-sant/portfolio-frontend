// @vitest-environment node
import { describe, expect, it } from "vitest"
import formatFlakyWarning from "@scripts/e2e/formatFlakyWarning"

describe("formatFlakyWarning", () => {
    it("não escreve nada quando não há teste flaky", () => {
        expect(formatFlakyWarning([])).toBe("")
    })

    it("avisa com a quantidade e uma linha por teste, com projeto e arquivo", () => {
        const output = formatFlakyWarning([
            { title: "abre o menu", file: "navigation.spec.ts", projectName: "mobile-dark" },
            { title: "troca o tema", file: "theme.spec.ts", projectName: "desktop-light" }
        ])

        expect(output).toContain("2 testes flaky")
        expect(output).toContain("[mobile-dark] navigation.spec.ts › abre o menu")
        expect(output).toContain("[desktop-light] theme.spec.ts › troca o tema")
    })

    it("usa o singular com um teste só", () => {
        const output = formatFlakyWarning([
            { title: "abre o menu", file: "navigation.spec.ts", projectName: "mobile-dark" }
        ])

        expect(output).toContain("1 teste flaky")
    })
})
