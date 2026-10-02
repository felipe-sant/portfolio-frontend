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

        expect(await screen.findByRole("heading", { name: "Olá, mundo!" })).toBeInTheDocument()
    })

    it("renderiza dentro do Provider da store sem avisos no console", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)

        render(<App />)

        expect(await screen.findByRole("heading", { name: "Olá, mundo!" })).toBeInTheDocument()
        expect(errorSpy).not.toHaveBeenCalled()
        expect(warnSpy).not.toHaveBeenCalled()
    })

    it("define título e meta description da página no head", async () => {
        render(<App />)

        expect(await screen.findByRole("heading", { name: "Olá, mundo!" })).toBeInTheDocument()
        expect(document.title).toBe("Título da Página")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Minha descrição personalizada."
        )
    })

    it("usa o título e a meta description de NotFound.page numa rota desconhecida", async () => {
        window.history.pushState({}, "", "/rota-que-nao-existe")

        render(<App />)

        expect(
            await screen.findByRole("heading", { name: "404 - Página não encontrada" })
        ).toBeInTheDocument()
        expect(document.title).toBe("Página não encontrada.")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "A página não existe ou você não possui acesso."
        )
    })
})
