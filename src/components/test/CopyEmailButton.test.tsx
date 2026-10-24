import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"
import CopyEmailButton from "@/components/CopyEmailButton"
import setLanguage from "@/i18n/setLanguage"
import expectNoAxeViolations from "@/testUtils/expectNoAxeViolations"

function stubClipboard(writeText: (text: string) => Promise<void>) {
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText } })
}

afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
})

describe("CopyEmailButton", () => {
    it("mantém o status no DOM e vazio antes do clique", () => {
        render(<CopyEmailButton email="contato@example.com" />)

        expect(screen.getByRole("status")).toBeEmptyDOMElement()
        expect(screen.getByRole("button", { name: "Copiar e-mail" })).toBeInTheDocument()
    })

    it("copia o e-mail, anuncia o resultado e volta ao rótulo inicial após 2,2 s", async () => {
        vi.useFakeTimers({ shouldAdvanceTime: true })
        const writeText = vi.fn().mockResolvedValue(undefined)
        stubClipboard(writeText)
        render(<CopyEmailButton email="contato@example.com" />)

        await userEvent.click(screen.getByRole("button", { name: "Copiar e-mail" }))

        expect(writeText).toHaveBeenCalledWith("contato@example.com")
        expect(screen.getByRole("button", { name: "E-mail copiado" })).toBeInTheDocument()
        expect(screen.getByRole("status")).toHaveTextContent("E-mail copiado")

        act(() => {
            vi.advanceTimersByTime(2200)
        })

        expect(screen.getByRole("button", { name: "Copiar e-mail" })).toBeInTheDocument()
        expect(screen.getByRole("status")).toBeEmptyDOMElement()
    })

    it("mostra e anuncia a falha quando a cópia é rejeitada", async () => {
        stubClipboard(vi.fn().mockRejectedValue(new Error("negado")))
        render(<CopyEmailButton email="contato@example.com" />)

        await userEvent.click(screen.getByRole("button", { name: "Copiar e-mail" }))

        expect(screen.getByRole("button", { name: "Não foi possível copiar" })).toBeInTheDocument()
        expect(screen.getByRole("status")).toHaveTextContent("Não foi possível copiar")
    })

    it("traduz os três textos em en e es", async () => {
        stubClipboard(vi.fn().mockResolvedValue(undefined))
        render(<CopyEmailButton email="a@b.c" />)

        await act(async () => {
            await setLanguage("en")
        })
        await userEvent.click(screen.getByRole("button", { name: "Copy email" }))

        expect(screen.getByRole("status")).toHaveTextContent("Email copied")

        await act(async () => {
            await setLanguage("es")
        })

        expect(screen.getByRole("button", { name: "Correo copiado" })).toBeInTheDocument()
    })

    it("não tem violações de acessibilidade", async () => {
        const { container } = render(<CopyEmailButton email="contato@example.com" />)

        await expectNoAxeViolations(container)
    }, 15000)
})
