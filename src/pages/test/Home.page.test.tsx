import { describe, expect, it } from "vitest"
import { act, render, screen } from "@testing-library/react"
import setLanguage from "@/i18n/setLanguage"
import HomePage from "@/pages/Home.page"

function renderHomePage() {
    return render(<HomePage />)
}

describe("HomePage", () => {
    it("renderiza o título principal", () => {
        renderHomePage()

        expect(screen.getByRole("heading", { name: "Olá, mundo!" })).toBeInTheDocument()
    })

    it("define título e meta description da página no head", () => {
        renderHomePage()

        expect(document.title).toBe("Título da Página")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Minha descrição personalizada."
        )
    })

    it("renderiza a vitrine de tokens de design", () => {
        renderHomePage()

        expect(screen.getByText("Rótulo de exemplo")).toBeInTheDocument()
        expect(screen.getByText("destaque")).toBeInTheDocument()
        expect(
            screen.getByText("Legenda de exemplo em texto secundário, para conteúdo complementar.")
        ).toBeInTheDocument()
        expect(screen.getByText("Sucesso")).toBeInTheDocument()
        expect(screen.getByText("Aviso")).toBeInTheDocument()
        expect(screen.getByText("Erro")).toBeInTheDocument()
    })

    it("traduz os metadados e o trecho em destaque quando o idioma é es", async () => {
        await setLanguage("es")

        renderHomePage()

        expect(document.title).toBe("Título de la página")
        expect(screen.getByText("destacado").tagName).toBe("STRONG")
    })

    it("atualiza texto, metadados e lang do html ao trocar o idioma com a página aberta", async () => {
        renderHomePage()
        expect(screen.getByRole("heading", { name: "Olá, mundo!" })).toBeInTheDocument()

        await act(() => setLanguage("es"))

        expect(screen.getByRole("heading", { name: "¡Hola, mundo!" })).toBeInTheDocument()
        expect(document.title).toBe("Título de la página")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Mi descripción personalizada."
        )
        expect(document.documentElement.lang).toBe("es")
    })
})
