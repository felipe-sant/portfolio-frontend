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
            screen.getByRole("link", { name: /^https:\/\/github\.com\/felipe-sant/ })
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

describe("MarkdownDocument, títulos e âncoras", () => {
    it("gera o id com letras acentuadas e minúsculas", () => {
        renderMarkdown("## Instalação\n\n## Decisões técnicas")

        expect(screen.getByRole("heading", { name: "Instalação" })).toHaveAttribute(
            "id",
            "instalação"
        )
        expect(screen.getByRole("heading", { name: "Decisões técnicas" })).toHaveAttribute(
            "id",
            "decisões-técnicas"
        )
    })

    it("remove a pontuação do id", () => {
        renderMarkdown("## Como usar? (rápido)")

        expect(screen.getByRole("heading", { name: "Como usar? (rápido)" })).toHaveAttribute(
            "id",
            "como-usar-rápido"
        )
    })

    it("dá sufixo ao título repetido e é estável entre renderizações", () => {
        const markdown = "## Exemplo\n\n## Exemplo"
        const first = renderMarkdown(markdown)
        const firstIds = Array.from(first.container.querySelectorAll("h3")).map(
            (heading) => heading.id
        )
        first.unmount()
        const second = renderMarkdown(markdown)
        const secondIds = Array.from(second.container.querySelectorAll("h3")).map(
            (heading) => heading.id
        )

        expect(firstIds).toEqual(["exemplo", "exemplo-1"])
        expect(secondIds).toEqual(firstIds)
    })

    it("rebaixa os títulos: ## vira h3 e até ###### vira h6, sem h1 nem h2", () => {
        const { container } = renderMarkdown(
            "# Um\n\n## Dois\n\n### Três\n\n#### Quatro\n\n##### Cinco\n\n###### Seis"
        )
        const levels = Array.from(container.querySelectorAll("h1, h2, h3, h4, h5, h6")).map(
            (heading) => heading.tagName
        )

        expect(levels).toEqual(["H3", "H3", "H4", "H5", "H6", "H6"])
        expect(screen.getByRole("heading", { name: "Dois" })).toHaveAttribute("id", "dois")
    })

    it("o link interno aponta para um título existente do mesmo documento", () => {
        renderMarkdown("[ir](#instalação)\n\n## Instalação")
        const link = screen.getByRole("link", { name: "ir" })
        const target = document.getElementById("instalação")

        expect(decodeURIComponent(link.getAttribute("href") ?? "")).toBe("#instalação")
        expect(target).not.toBeNull()
        expect(target?.tagName).toBe("H3")
    })
})
