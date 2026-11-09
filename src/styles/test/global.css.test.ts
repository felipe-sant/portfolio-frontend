import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

const css = readFileSync("src/styles/global.css", "utf-8")

function readBlock(selector: string): string {
    const start = css.indexOf(`\n${selector} {`)
    if (start === -1) {
        return ""
    }
    return css.slice(start, css.indexOf("\n}", start))
}

function readAllBlocks(selector: string): string {
    return css
        .split(`\n${selector} {`)
        .slice(1)
        .map((chunk) => chunk.slice(0, chunk.indexOf("\n}")))
        .join("\n")
}

const rootBlock = readBlock(":root")
const darkBlock = readBlock('[data-theme="dark"]')

describe("global.css", () => {
    it("reserva a calha da barra de rolagem em html", () => {
        expect(readAllBlocks("html")).toContain("scrollbar-gutter: stable")
    })

    it("declara os tokens de cromo, código, foco e cabeçalho no tema claro", () => {
        expect(rootBlock).toContain("--surface-chrome: var(--bg-page)")
        expect(rootBlock).toContain("--border-chrome: var(--border-subtle)")
        expect(rootBlock).toContain("--focus-ring: var(--brand-deep)")
        expect(rootBlock).toContain("--header-height: 4rem")
        expect(rootBlock).toContain("color-scheme: light")
        for (const token of [
            "--code-bg",
            "--code-text",
            "--code-comment",
            "--code-keyword",
            "--code-string",
            "--code-number",
            "--code-function",
            "--code-type"
        ]) {
            expect(rootBlock).toContain(`${token}:`)
            expect(darkBlock).toContain(`${token}:`)
        }
    })

    it("declara a escala de texto de etiqueta e de data", () => {
        expect(rootBlock).toContain("--text-chip: 0.75rem")
        expect(rootBlock).toContain("--text-body-sm: 0.875rem")
    })

    it("declara o tema escuro por data-theme com color-scheme", () => {
        expect(darkBlock).toContain("color-scheme: dark")
        expect(darkBlock).toContain("--surface-chrome: #141210")
        expect(darkBlock).toContain("--border-chrome: #2c2925")
        expect(darkBlock).toContain("--focus-ring: var(--brand-variant)")
        expect(darkBlock).toContain("--bg-page: var(--dark-bg)")
    })

    it("declara a borda de campo de texto nos dois temas", () => {
        expect(rootBlock).toContain("--border-control: var(--neutral-500)")
        expect(darkBlock).toContain("--border-control: var(--dark-500)")
    })

    it("não usa prefers-color-scheme para o tema", () => {
        expect(css).not.toContain("prefers-color-scheme")
    })

    it("usa brand-variant como anel de foco nas faixas escuras", () => {
        expect(readBlock('[data-surface="band"]')).toContain("--focus-ring: var(--brand-variant)")
    })

    it("define o foco visível global", () => {
        const block = readBlock(":focus-visible")

        expect(block).toContain("outline: 2px solid var(--focus-ring)")
        expect(block).toContain("outline-offset: 2px")
        expect(block).toContain("border-radius: var(--radius)")
    })

    it("reserva o cabeçalho na rolagem", () => {
        expect(readBlock("html")).toContain("scroll-padding-top: var(--header-height)")
    })

    it("sublinha links e limita a medida do parágrafo sem justificar", () => {
        const link = readBlock("a")
        const paragraph = readBlock("p")

        expect(link).toContain("text-decoration: underline")
        expect(link).toContain("text-decoration-thickness: 1px")
        expect(link).toContain("text-underline-offset")
        expect(paragraph).toContain("max-width: var(--measure)")
        expect(paragraph).toContain("line-height: var(--lh-body)")
        expect(paragraph).toContain("text-align: start")
        expect(css).not.toContain("justify")
    })
})
