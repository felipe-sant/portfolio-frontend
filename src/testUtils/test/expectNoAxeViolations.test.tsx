import { createElement } from "react"
import { describe, expect, it } from "vitest"
import { render } from "@testing-library/react"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

describe("expectNoAxeViolations", () => {
    it("resolve quando a marcação não tem violação", async () => {
        const { container } = render(
            <main>
                <h1>Título</h1>
                <button type="button">Enviar</button>
            </main>
        )

        await expect(expectNoAxeViolations(container)).resolves.toBeUndefined()
    })

    it("rejeita com o id da regra e o alvo quando há imagem sem alt", async () => {
        const { container } = render(
            <main>{createElement("img", { id: "avatar", src: "x.png" })}</main>
        )

        await expect(expectNoAxeViolations(container)).rejects.toThrow(/image-alt[\s\S]*#avatar/)
    })

    it("rejeita com o id da regra quando o botão não tem nome", async () => {
        const { container } = render(
            <main>{createElement("button", { id: "empty", type: "button" })}</main>
        )

        await expect(expectNoAxeViolations(container)).rejects.toThrow(/button-name[\s\S]*#empty/)
    })

    it("não falha por contraste ruim, que o jsdom não calcula", async () => {
        const { container } = render(
            <main>
                <p style={{ color: "#777777", backgroundColor: "#7a7a7a" }}>Texto</p>
            </main>
        )

        await expect(expectNoAxeViolations(container)).resolves.toBeUndefined()
    })
})
