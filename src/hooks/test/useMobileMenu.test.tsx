import { afterEach, describe, expect, it, vi } from "vitest"
import { act, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createMemoryRouter, Link, RouterProvider } from "react-router-dom"
import useMobileMenu from "@/hooks/useMobileMenu"

function Harness() {
    const { isOpen, panelId, buttonRef, panelRef, toggle } = useMobileMenu()

    return (
        <div>
            <button type="button" ref={buttonRef} onClick={toggle}>
                Alternar
            </button>
            <p>{isOpen ? "aberto" : "fechado"}</p>
            <div ref={panelRef} id={panelId}>
                <Link to="/primeiro">Primeiro</Link>
                <Link to="/en/primeiro">Idioma</Link>
                <button type="button">Último</button>
            </div>
        </div>
    )
}

function renderHarness(initialEntries = ["/pt-BR/primeiro"]) {
    const router = createMemoryRouter([{ path: "*", element: <Harness /> }], { initialEntries })
    render(<RouterProvider router={router} />)
    return router
}

type Listener = (event: { matches: boolean }) => void

function stubMatchMedia(initial: boolean) {
    const listeners = new Set<Listener>()
    let matches = initial

    vi.stubGlobal("matchMedia", () => ({
        get matches() {
            return matches
        },
        addEventListener: (_type: string, listener: Listener) => listeners.add(listener),
        removeEventListener: (_type: string, listener: Listener) => listeners.delete(listener)
    }))

    return (next: boolean) => {
        matches = next
        listeners.forEach((listener) => listener({ matches: next }))
    }
}

afterEach(() => {
    vi.unstubAllGlobals()
    document.body.style.overflow = ""
})

describe("useMobileMenu", () => {
    it("começa fechado e abre focando o primeiro link do painel", async () => {
        renderHarness()

        expect(screen.getByText("fechado")).toBeInTheDocument()

        await userEvent.click(screen.getByRole("button", { name: "Alternar" }))

        expect(screen.getByText("aberto")).toBeInTheDocument()
        expect(screen.getByRole("link", { name: "Primeiro" })).toHaveFocus()
    })

    it("fecha por toggle", async () => {
        renderHarness()
        const button = screen.getByRole("button", { name: "Alternar" })

        await userEvent.click(button)
        await userEvent.click(button)

        expect(screen.getByText("fechado")).toBeInTheDocument()
    })

    it("fecha por Esc devolvendo o foco ao botão", async () => {
        renderHarness()
        await userEvent.click(screen.getByRole("button", { name: "Alternar" }))

        await userEvent.keyboard("{Escape}")

        expect(screen.getByText("fechado")).toBeInTheDocument()
        expect(screen.getByRole("button", { name: "Alternar" })).toHaveFocus()
    })

    it("trava a rolagem aberto e destrava fechado", async () => {
        renderHarness()
        const button = screen.getByRole("button", { name: "Alternar" })

        await userEvent.click(button)
        expect(document.body.style.overflow).toBe("hidden")

        await userEvent.click(button)
        expect(document.body.style.overflow).toBe("")
    })

    it("circula o Tab entre o último item do painel e o botão", async () => {
        renderHarness()
        const button = screen.getByRole("button", { name: "Alternar" })
        await userEvent.click(button)
        screen.getByRole("button", { name: "Último" }).focus()

        await userEvent.tab()
        expect(button).toHaveFocus()

        await userEvent.tab({ shift: true })
        expect(screen.getByRole("button", { name: "Último" })).toHaveFocus()
    })

    it("fecha ao mudar de rota", async () => {
        const router = renderHarness()
        await userEvent.click(screen.getByRole("button", { name: "Alternar" }))

        await act(async () => {
            await router.navigate("/pt-BR/segundo")
        })

        expect(screen.getByText("fechado")).toBeInTheDocument()
    })

    it("não fecha ao trocar só o prefixo de idioma", async () => {
        const router = renderHarness()
        await userEvent.click(screen.getByRole("button", { name: "Alternar" }))

        await act(async () => {
            await router.navigate("/en/primeiro")
        })

        expect(screen.getByText("aberto")).toBeInTheDocument()
    })

    it("fecha ao alargar a janela", async () => {
        const setDesktop = stubMatchMedia(false)
        renderHarness()
        await userEvent.click(screen.getByRole("button", { name: "Alternar" }))

        act(() => setDesktop(true))

        expect(screen.getByText("fechado")).toBeInTheDocument()
        expect(document.body.style.overflow).toBe("")
    })
})
