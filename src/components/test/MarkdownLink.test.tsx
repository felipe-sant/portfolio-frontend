import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import MarkdownLink from "@/components/MarkdownLink"
import setLanguage from "@/i18n/setLanguage"

const ID = "01a131df-93ee-72f3-8c7a-f67501e47a7a"

function renderLink(href: string | undefined, text = "texto do link") {
    return render(
        <MemoryRouter>
            <MarkdownLink href={href}>{text}</MarkdownLink>
        </MemoryRouter>
    )
}

describe("MarkdownLink", () => {
    it("transforma project:<id> em link interno para o projeto no idioma, na mesma aba", () => {
        renderLink(`project:${ID}`)
        const link = screen.getByRole("link", { name: "texto do link" })

        expect(link).toHaveAttribute("href", `/pt-BR/projects/${ID}`)
        expect(link).not.toHaveAttribute("target")
    })

    it("transforma project:<id>/docs/<name> no documento e mantém a âncora", () => {
        renderLink(`project:${ID}/docs/SETUP.md#instalação`)

        expect(screen.getByRole("link")).toHaveAttribute(
            "href",
            `/pt-BR/projects/${ID}/docs/SETUP.md#instalação`
        )
    })

    it("mantém a âncora depois do projeto sem documento", () => {
        renderLink(`project:${ID}#stack`)

        expect(screen.getByRole("link")).toHaveAttribute("href", `/pt-BR/projects/${ID}#stack`)
    })

    it("mostra só o texto quando o id do project: não é um UUID v7", () => {
        const { container } = renderLink("project:abc")

        expect(container.querySelector("a")).toBeNull()
        expect(container).toHaveTextContent("texto do link")
    })

    it("mostra só o texto sem href", () => {
        const { container } = renderLink(undefined)

        expect(container.querySelector("a")).toBeNull()
    })

    it.each([
        ["pt-BR", "(abre em nova aba)"],
        ["en", "(opens in a new tab)"],
        ["es", "(se abre en una pestaña nueva)"]
    ] as const)(
        "abre https e http em nova aba com rel e aviso oculto em %s",
        async (language, notice) => {
            renderLink("https://github.com/felipe-sant")
            await act(() => setLanguage(language))
            const link = screen.getByRole("link")

            expect(link).toHaveAttribute("target", "_blank")
            expect(link).toHaveAttribute("rel", "noopener noreferrer")
            expect(link).toHaveAccessibleName(`texto do link ${notice}`)
        }
    )

    it("abre http em nova aba", () => {
        renderLink("http://example.com")

        expect(screen.getByRole("link")).toHaveAttribute("target", "_blank")
    })

    it("deixa mailto sem target e sem aviso de nova aba", () => {
        renderLink("mailto:felipe@example.com")
        const link = screen.getByRole("link")

        expect(link).not.toHaveAttribute("target")
        expect(link).toHaveAccessibleName("texto do link")
    })

    it("aceita o esquema project: e mailto: em qualquer caixa", () => {
        const { unmount } = renderLink(`PROJECT:${ID}`)

        expect(screen.getByRole("link")).toHaveAttribute("href", `/pt-BR/projects/${ID}`)
        unmount()
        renderLink("MAILTO:felipe@example.com")

        expect(screen.getByRole("link")).not.toHaveAttribute("target")
    })

    it("rola até o título da âncora no documento, sem navegar", async () => {
        const user = userEvent.setup()
        const scrollIntoView = vi.fn()
        render(
            <MemoryRouter>
                <MarkdownLink href={"#instala%C3%A7%C3%A3o"}>{"ir"}</MarkdownLink>
                <h3 id="instalação">{"Instalação"}</h3>
            </MemoryRouter>
        )
        const target = screen.getByRole("heading", { name: "Instalação" })
        target.scrollIntoView = scrollIntoView

        await user.click(screen.getByRole("link", { name: "ir" }))

        expect(scrollIntoView).toHaveBeenCalledTimes(1)
        expect(window.location.hash).toBe("")
    })

    it("aplica a classe de link em texto corrido", () => {
        renderLink("https://github.com")

        expect(screen.getByRole("link").className).toContain("link")
    })
})
