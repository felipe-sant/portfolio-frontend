import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import App from "@/App"

afterEach(() => {
    window.history.pushState({}, "", "/")
    vi.restoreAllMocks()
})

describe("App", () => {
    it("renderiza a página inicial na rota raiz", async () => {
        render(<App />)

        expect(
            await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript." })
        ).toBeInTheDocument()
    })

    it("renderiza dentro do Provider da store sem avisos no console", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

        render(<App />)

        expect(
            await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript." })
        ).toBeInTheDocument()
        expect(errorSpy).not.toHaveBeenCalled()
        expect(warnSpy).not.toHaveBeenCalled()
    })

    it("define título e meta description da página no head", async () => {
        render(<App />)

        expect(
            await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript." })
        ).toBeInTheDocument()
        expect(document.title).toBe("Luiz Felipe dos Santos · Desenvolvedor full stack")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Portfólio de Luiz Felipe dos Santos, desenvolvedor full stack em TypeScript: projetos, trajetória e contato."
        )
    })

    it("usa o título e a meta description de NotFound.page numa rota desconhecida", async () => {
        window.history.pushState({}, "", "/rota-que-nao-existe")

        render(<App />)

        expect(
            await screen.findByRole("heading", { name: "Página não encontrada" })
        ).toBeInTheDocument()
        expect(document.title).toBe("Página não encontrada · Luiz Felipe dos Santos")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "O endereço acessado não existe neste portfólio."
        )
    })
})
