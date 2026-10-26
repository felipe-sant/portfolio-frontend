import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, render, screen } from "@testing-library/react"
import MarkdownDocument from "@/components/MarkdownDocument"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

const TABLE = "| a | b |\n|---|---|\n| 1 | 2 |"

function renderMarkdown(content: string) {
    return render(
        <MemoryRouter>
            <MarkdownDocument content={content} />
        </MemoryRouter>
    )
}

describe("MarkdownTable", () => {
    it("sai com thead e th scope col mesmo sem linha de dados", () => {
        const { container } = renderMarkdown("| a | b |\n|---|---|")

        expect(container.querySelector("thead")).not.toBeNull()
        expect(
            Array.from(container.querySelectorAll("th")).map((cell) => cell.getAttribute("scope"))
        ).toEqual(["col", "col"])
    })

    it("põe cada tabela num contêiner focável com nome Tabela N na ordem do documento", () => {
        renderMarkdown(`${TABLE}\n\ntexto\n\n${TABLE}`)
        const first = screen.getByRole("region", { name: "Tabela 1" })
        const second = screen.getByRole("region", { name: "Tabela 2" })

        expect(first).toHaveAttribute("tabindex", "0")
        expect(second).toHaveAttribute("tabindex", "0")
        expect(first.querySelector("table")).not.toBeNull()
    })

    it.each([
        ["en", "Table 1"],
        ["es", "Tabla 1"]
    ] as const)("traduz o nome do contêiner em %s", async (language, name) => {
        renderMarkdown(TABLE)
        await act(() => setLanguage(language))

        expect(screen.getByRole("region", { name })).toBeInTheDocument()
    })

    it("aplica o alinhamento do markdown às células", () => {
        const { container } = renderMarkdown("| a | b | c |\n|:---|---:|:---:|\n| 1 | 2 | 3 |")
        const align = (selector: string) =>
            Array.from(container.querySelectorAll(selector)).map(
                (cell) => (cell as HTMLElement).style.textAlign
            )

        expect(align("th")).toEqual(["left", "right", "center"])
        expect(align("td")).toEqual(["left", "right", "center"])
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = renderMarkdown(`${TABLE}\n\n${TABLE}`)

        await expectNoAxeViolations(container)
    }, 15000)
})
