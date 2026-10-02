import { describe, expect, it } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { render, screen } from "@testing-library/react"
import NotFoundPage from "@/pages/NotFound.page"

describe("NotFoundPage", () => {
    it("renderiza o título de página não encontrada", () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Página não encontrada" })).toBeInTheDocument()
    })

    it("oferece um link de volta para a página inicial", () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("link", { name: "Voltar para o início" })).toHaveAttribute(
            "href",
            "/"
        )
    })

    it("não aplica atributo class no heading", () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        )

        expect(screen.getByRole("heading", { name: "Página não encontrada" })).not.toHaveAttribute(
            "class"
        )
    })

    it("define o title e a meta description da página", () => {
        render(
            <MemoryRouter>
                <NotFoundPage />
            </MemoryRouter>
        )

        expect(document.title).toBe("Página não encontrada · Luiz Felipe dos Santos")
        expect(document.querySelector('meta[name="description"]')?.getAttribute("content")).toBe(
            "O endereço acessado não existe neste portfólio."
        )
    })
})
