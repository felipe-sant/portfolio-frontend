import { describe, expect, it } from "vitest"
import { render, screen } from "@testing-library/react"
import TextDocument from "@/components/TextDocument"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const CONTENT = "<script>x()</script>\n# título\n[x](https://a.b)\n**negrito**\n  indentado"

function renderText(lang?: string) {
    return render(
        <>
            <h2 id="titulo">{"LICENSE"}</h2>
            <TextDocument content={CONTENT} labelledBy="titulo" lang={lang} />
        </>
    )
}

describe("TextDocument", () => {
    it("mostra o conteúdo como texto literal sem criar elemento, link, título ou realce", () => {
        const { container } = renderText()
        const block = screen.getByRole("region", { name: "LICENSE" })

        expect(block.textContent).toBe(CONTENT)
        expect(block.children).toHaveLength(0)
        expect(container.querySelector("script, a, h1, span")).toBeNull()
    })

    it("preserva as quebras de linha e não quebra automaticamente", () => {
        renderText()
        const block = screen.getByRole("region", { name: "LICENSE" })

        expect(block.tagName).toBe("PRE")
        expect(block.textContent?.split("\n")).toHaveLength(5)
        expect(block.className).toContain("text")
    })

    it("é focável e nomeado pelo título recebido", () => {
        renderText()
        const block = screen.getByRole("region", { name: "LICENSE" })

        expect(block).toHaveAttribute("tabindex", "0")
        expect(block).toHaveAttribute("aria-labelledby", "titulo")
    })

    it("leva lang só quando recebe", () => {
        const withLang = renderText("en")
        expect(screen.getByRole("region")).toHaveAttribute("lang", "en")
        withLang.unmount()

        renderText()
        expect(screen.getByRole("region")).not.toHaveAttribute("lang")
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderText("en")

        await expectNoAxeViolations(container)
    }, 15000)
})
