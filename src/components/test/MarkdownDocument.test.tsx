import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import MarkdownDocument from "@/components/MarkdownDocument"

function renderMarkdown(content: string) {
    return render(
        <MemoryRouter>
            <MarkdownDocument content={content} />
        </MemoryRouter>
    )
}

describe("MarkdownDocument, segurança", () => {
    it("não renderiza HTML embutido como elemento", () => {
        const { container } = renderMarkdown(
            'Antes\n\n<script>window.hacked = true</script>\n\n<div onclick="x()">caixa</div>\n\n<iframe src="https://a.b"></iframe>\n\nDepois'
        )

        expect(container.querySelector("script, iframe, [onclick]")).toBeNull()
        expect(container.innerHTML).not.toContain("onclick")
        expect(Reflect.get(window, "hacked")).toBeUndefined()
        expect(screen.getByText("Depois")).toBeInTheDocument()
    })

    it("não gera img para imagem em markdown", () => {
        const { container } = renderMarkdown("![texto alternativo](https://a.b/x.png)")

        expect(container.querySelector("img")).toBeNull()
    })

    it("não gera section de notas nem sup de referência para nota de rodapé", () => {
        const { container } = renderMarkdown("Texto[^1]\n\n[^1]: A nota")

        expect(container.querySelector("section, sup")).toBeNull()
        expect(screen.queryByText("A nota")).not.toBeInTheDocument()
    })

    it.each([
        "[clique](javascript:alert(1))",
        "[clique](data:text/html;base64,AAAA)",
        "<javascript:alert(1)>",
        "[clique](/caminho/relativo)"
    ])("deixa %j como texto sem link", (markdown) => {
        const { container } = renderMarkdown(markdown)

        expect(container.querySelector("a")).toBeNull()
    })
})

describe("MarkdownDocument, GFM", () => {
    it("renderiza tachado como del", () => {
        const { container } = renderMarkdown("~~velho~~")

        expect(container.querySelector("del")).toHaveTextContent("velho")
    })

    it("transforma autolink https em link", () => {
        renderMarkdown("Veja https://github.com/felipe-sant")

        expect(
            screen.getByRole("link", { name: "https://github.com/felipe-sant" })
        ).toHaveAttribute("href", "https://github.com/felipe-sant")
    })

    it("renderiza lista de tarefas e tabela", () => {
        const { container } = renderMarkdown(
            "- [x] feito\n- [ ] a fazer\n\n| a | b |\n|---|---|\n| 1 | 2 |"
        )

        expect(container.querySelectorAll('input[type="checkbox"]')).toHaveLength(2)
        expect(screen.getByRole("table")).toBeInTheDocument()
    })
})
