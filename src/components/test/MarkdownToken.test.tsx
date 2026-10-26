import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import MarkdownToken from "@/components/MarkdownToken"
import css from "@/styles/components/markdownCodeBlock.module.css"

function renderToken(className?: string) {
    const { container } = render(<MarkdownToken className={className}>valor</MarkdownToken>)
    const span = container.querySelector("span")

    if (!span) {
        throw new Error("O span do token não foi renderizado")
    }

    return span
}

describe("MarkdownToken", () => {
    it.each([
        ["hljs-keyword", "keyword"],
        ["hljs-quote", "comment"],
        ["hljs-regexp", "string"],
        ["hljs-number", "number"],
        ["hljs-title", "function"],
        ["hljs-built_in", "type"]
    ])("mapeia %s para a classe %s do módulo", (hljsClass, key) => {
        const span = renderToken(hljsClass)

        expect(css[key]).toBeDefined()
        expect(span).toHaveClass(css[key])
        expect(span).toHaveTextContent("valor")
    })

    it("trata hljs-title com class_ como tipo, não como função", () => {
        const span = renderToken("hljs-title class_")

        expect(span).toHaveClass(css.type)
        expect(span).not.toHaveClass(css.function)
    })

    it("não aplica classe a um token que o módulo não conhece", () => {
        expect(renderToken("hljs-desconhecido")).not.toHaveAttribute("class")
    })

    it("não aplica classe quando não há classe hljs- nem className", () => {
        expect(renderToken("outra")).not.toHaveAttribute("class")
        expect(renderToken(undefined)).not.toHaveAttribute("class")
    })
})
