import { afterEach, describe, expect, it, vi } from "vitest"
import { render, screen } from "@testing-library/react"
import App from "@/App"
import THEME_STORAGE_KEY from "@/utils/themeStorageKey"

afterEach(() => {
    window.history.pushState({}, "", "/")
    vi.restoreAllMocks()
})

describe("App", () => {
    it("redireciona a raiz para o idioma do navegador", async () => {
        render(<App />)

        expect(
            await screen.findByRole("heading", { name: "Full stack developer in TypeScript" })
        ).toBeInTheDocument()
        expect(window.location.pathname).toBe("/en")
    })

    it("renderiza a página inicial na rota do idioma", async () => {
        window.history.pushState({}, "", "/pt-BR")

        render(<App />)

        expect(
            await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        ).toBeInTheDocument()
    })

    it("renderiza dentro do Provider da store sem avisos no console", async () => {
        const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined)
        const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined)
        window.history.pushState({}, "", "/pt-BR")

        render(<App />)

        expect(
            await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        ).toBeInTheDocument()
        expect(errorSpy).not.toHaveBeenCalled()
        expect(warnSpy).not.toHaveBeenCalled()
    })

    it("define título e meta description da página no head", async () => {
        window.history.pushState({}, "", "/pt-BR")

        render(<App />)

        expect(
            await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        ).toBeInTheDocument()
        expect(document.title).toBe("Luiz Felipe dos Santos · Desenvolvedor full stack")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "Portfólio de Luiz Felipe dos Santos, desenvolvedor full stack em TypeScript: projetos, trajetória e contato."
        )
    })

    it("aplica o tema escuro salvo no html", async () => {
        localStorage.setItem(THEME_STORAGE_KEY, "dark")
        window.history.pushState({}, "", "/pt-BR")

        render(<App />)

        expect(
            await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        ).toBeInTheDocument()
        expect(document.documentElement).toHaveAttribute("data-theme", "dark")
    })

    it("ignora ?tema= na URL e segue o sistema", async () => {
        window.history.pushState({}, "", "/pt-BR?tema=dark")

        render(<App />)

        expect(
            await screen.findByRole("heading", { name: "Desenvolvedor full stack em TypeScript" })
        ).toBeInTheDocument()
        expect(document.documentElement).toHaveAttribute("data-theme", "light")
    })

    it("usa o título e a meta description de NotFound.page numa rota desconhecida", async () => {
        window.history.pushState({}, "", "/pt-BR/rota-que-nao-existe")

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
