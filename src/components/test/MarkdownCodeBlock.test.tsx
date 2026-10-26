import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, render, screen, within } from "@testing-library/react"
import MarkdownDocument from "@/components/MarkdownDocument"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function renderMarkdown(content: string) {
    return render(
        <MemoryRouter>
            <MarkdownDocument content={content} />
        </MemoryRouter>
    )
}

function fence(info: string, body: string) {
    return `\`\`\`${info}\n${body}\n\`\`\``
}

describe("MarkdownCodeBlock", () => {
    it("mostra arquivo e linguagem no cabeçalho, realça e nomeia o bloco pelo cabeçalho", () => {
        const { container } = renderMarkdown(
            fence('ts title="src/group.ts"', "const total: number = 1")
        )
        const block = screen.getByRole("region", { name: /src\/group\.ts/ })
        const header = container.querySelector("[id]") as HTMLElement

        expect(header).toHaveTextContent("src/group.ts")
        expect(header).toHaveTextContent("TypeScript")
        expect(block.tagName).toBe("PRE")
        expect(block).toHaveAttribute("tabindex", "0")
        expect(block).toHaveAttribute("aria-labelledby", header.id)
        expect(block.querySelectorAll("code span[class]").length).toBeGreaterThan(0)
    })

    it("define no módulo de estilo a classe do nome do arquivo usada no cabeçalho", () => {
        renderMarkdown(fence('ts title="src/group.ts"', "const total = 1"))
        const styles = readFileSync("src/styles/components/markdownCodeBlock.module.css", "utf-8")

        expect(screen.getByText("src/group.ts").className).toContain("file")
        expect(styles).toMatch(/^\.file \{/m)
    })

    it("com só a linguagem, o cabeçalho tem só a linguagem", () => {
        const { container } = renderMarkdown(fence("bash", "echo oi"))
        const header = container.querySelector("[id]")

        expect(header).toHaveTextContent(/^Bash$/)
        expect(screen.getByRole("region", { name: "Bash" })).toBeInTheDocument()
    })

    it("sem linguagem nem arquivo, não realça, não tem cabeçalho e se chama Código", () => {
        const { container } = renderMarkdown(fence("", "const total = 1"))
        const block = screen.getByRole("region", { name: "Código" })

        expect(container.querySelector("[id]")).toBeNull()
        expect(block.querySelector("span")).toBeNull()
    })

    it.each([
        ["typescript", "TypeScript", "const total: number = 1"],
        ["javascript", "JavaScript", "function soma() { return 1 }"],
        ["tsx", "TSX", 'const item = <div className="a">{total}</div>'],
        ["java", "Java", "public class A { int total = 1; }"],
        ["python", "Python", "def soma():\n    return 1"],
        ["json", "JSON", '{ "total": 1 }'],
        ["bash", "Bash", 'echo "oi"'],
        ["env", ".env", "API_URL=https://example.com"]
    ])("realça %s com o nome %s", (language, label, body) => {
        const { container } = renderMarkdown(fence(language, body))

        expect(container.querySelector("[id]")).toHaveTextContent(label)
        expect(container.querySelectorAll("pre code span").length).toBeGreaterThan(0)
    })

    it.each([
        ["ts", "TypeScript"],
        ["js", "JavaScript"],
        ["py", "Python"],
        ["sh", "Bash"]
    ])("resolve o apelido %s para %s", (alias, label) => {
        const { container } = renderMarkdown(fence(alias, "x"))

        expect(container.querySelector("[id]")).toHaveTextContent(label)
    })

    it("deixa mermaid como bloco comum com o nome da linguagem e sem realce", () => {
        const { container } = renderMarkdown(fence("mermaid", "graph TD\n  A --> B"))

        expect(container.querySelector("[id]")).toHaveTextContent("mermaid")
        expect(container.querySelector("pre code span")).toBeNull()
    })

    it("usa a classe de código em linha, sem cabeçalho nem rolagem", () => {
        const { container } = renderMarkdown("Use `npm run dev` agora")
        const inline = container.querySelector("p code")

        expect(inline?.className).toContain("inline")
        expect(inline?.closest("pre")).toBeNull()
        expect(container.querySelector("[id]")).toBeNull()
        expect(container.querySelector("[tabindex]")).toBeNull()
    })

    it("traduz o rótulo do bloco sem linguagem", async () => {
        renderMarkdown(fence("", "x"))
        await act(() => setLanguage("en"))

        expect(within(document.body).getByRole("region", { name: "Code" })).toBeInTheDocument()
    })

    it("numera o nome dos blocos que repetem linguagem, sem numerar o que é único", () => {
        renderMarkdown(
            `${fence("bash", "a")}\n\n${fence("ts", "b")}\n\n${fence("sh", "c")}\n\n${fence("", "d")}`
        )

        expect(screen.getByRole("region", { name: "Bash 1" })).toBeInTheDocument()
        expect(screen.getByRole("region", { name: "Bash 2" })).toBeInTheDocument()
        expect(screen.getByRole("region", { name: "TypeScript" })).toBeInTheDocument()
        expect(screen.getByRole("region", { name: "Código" })).toBeInTheDocument()
    })

    it("numera blocos com o mesmo arquivo e sem linguagem", () => {
        renderMarkdown(`${fence("", "a")}\n\n${fence("", "b")}`)

        expect(screen.getByRole("region", { name: "Código 1" })).toBeInTheDocument()
        expect(screen.getByRole("region", { name: "Código 2" })).toBeInTheDocument()
    })

    it("com blocos repetidos, não tem violações de acessibilidade", async () => {
        const { container } = renderMarkdown(
            `${fence("bash", "a")}\n\n${fence("bash", "b")}\n\n${fence("", "c")}\n\n${fence("", "d")}`
        )

        await expectNoAxeViolations(container)
    }, 15000)

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderMarkdown(
            `${fence('ts title="a.ts"', "const a = 1")}\n\n${fence("", "texto")}\n\nUse \`x\``
        )

        await expectNoAxeViolations(container)
    }, 15000)
})
