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

        expect(
            screen.getByRole("heading", { name: "Desenvolvedor full stack em TypeScript." })
        ).toBeInTheDocument()
    })

    it("renderiza a frase de apresentação", () => {
        renderHomePage()

        expect(
            screen.getByText("Trabalho em produtos web de ponta a ponta, do banco à interface.")
        ).toBeInTheDocument()
    })

    it("define título e meta description da página no head", () => {
        renderHomePage()

        expect(document.title).toBe("Luiz Felipe dos Santos · Desenvolvedor full stack")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Portfólio de Luiz Felipe dos Santos, desenvolvedor full stack em TypeScript: projetos, trajetória e contato."
        )
    })

    it("traduz os metadados quando o idioma é es", async () => {
        await setLanguage("es")

        renderHomePage()

        expect(document.title).toBe("Luiz Felipe dos Santos · Desarrollador full stack")
    })

    it("atualiza texto, metadados e lang do html ao trocar o idioma com a página aberta", async () => {
        renderHomePage()
        expect(
            screen.getByRole("heading", { name: "Desenvolvedor full stack em TypeScript." })
        ).toBeInTheDocument()

        await act(() => setLanguage("es"))

        expect(
            screen.getByRole("heading", { name: "Desarrollador full stack en TypeScript." })
        ).toBeInTheDocument()
        expect(document.title).toBe("Luiz Felipe dos Santos · Desarrollador full stack")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Portafolio de Luiz Felipe dos Santos, desarrollador full stack en TypeScript: proyectos, trayectoria y contacto."
        )
        expect(document.documentElement.lang).toBe("es")
    })
})
